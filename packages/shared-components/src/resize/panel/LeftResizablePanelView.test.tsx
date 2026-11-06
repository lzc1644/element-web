/*
 * Copyright 2026 Element Creations Ltd.
 *
 * SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
 * Please see LICENSE files in the repository root for full details.
 */

import React from "react";
import { act, render, screen, waitFor } from "@test-utils";
import { composeStories } from "@storybook/react-vite";
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";

import * as stories from "./LeftResizablePanelView.stories";
import { BaseViewModel } from "../../core/viewmodel";
import {
    ResizableGroup,
    LEFT_PANEL_ID,
    LeftResizablePanelView,
    type LeftResizablePanelViewActions,
    Panel,
    type PanelImperativeHandle,
    type PanelSize,
    type ResizerViewSnapshot,
    Separator,
} from "..";

const { Default } = composeStories(stories);

class MockViewModel extends BaseViewModel<ResizerViewSnapshot, unknown> implements LeftResizablePanelViewActions {
    public constructor(snapshot: ResizerViewSnapshot) {
        super(undefined, snapshot);
    }

    public onLeftPanelResize: (panelSize: PanelSize) => void = vi.fn();
    public setPanelHandle: (handle: PanelImperativeHandle) => void = vi.fn();
}

function renderPanel(initialSnapshot?: Partial<ResizerViewSnapshot>): MockViewModel {
    const snapshot = { isCollapsed: false, isFocusedViaKeyboard: false, initialSize: 20, ...initialSnapshot };
    const vm = new MockViewModel(snapshot);
    render(
        <ResizableGroup style={{ width: "900px", height: "300px" }}>
            <LeftResizablePanelView vm={vm} minSize="64px" maxSize="370px" collapsedThreshold="32px">
                Left
            </LeftResizablePanelView>
            <Separator />
            <Panel id="main-content" minSize="360px">
                Test
            </Panel>
        </ResizableGroup>,
    );
    return vm;
}

describe("<LeftResizablePanelView />", () => {
    it("renders Default story", () => {
        const { container } = render(<Default />);
        expect(container).toMatchSnapshot();
    });

    it("should call setPanelHandle", () => {
        const vm = renderPanel();
        expect(vm.setPanelHandle).toHaveBeenCalled();
    });

    it("should call onLeftPanelResize", async () => {
        const vm = renderPanel();
        const separator = screen.getByRole("separator");
        const { x, y, width, height } = separator.getBoundingClientRect();
        const start = { x: x + width / 2, y: y + height / 2 };
        const user = userEvent.setup();
        // Start on the separator instead of relying on where the browser pointer was left.
        await user.pointer([
            { target: separator, keys: "[MouseLeft>]", coords: start },
            { coords: { ...start, x: start.x + 50 } },
            { keys: "[/MouseLeft]" },
        ]);
        await waitFor(() => expect(vm.onLeftPanelResize).toHaveBeenCalled());
    });

    it("should restore a pixel width, resize continuously and reverse a collapse", async () => {
        const vm = renderPanel({ initialSize: "150px" });
        const handle = vi.mocked(vm.setPanelHandle).mock.calls[0][0];
        expect(handle.getSize().inPixels).toBeCloseTo(150);
        act(() => {
            handle.resize("64px");
        });
        expect(handle.getSize().inPixels).toBeCloseTo(64);
        act(() => {
            handle.resize("150px");
        });
        expect(handle.getSize().inPixels).toBeCloseTo(150);

        const user = userEvent.setup();
        const separator = screen.getByRole("separator");
        const mainContent = screen.getByTestId("main-content");
        const initialContentWidth = mainContent.getBoundingClientRect().width;
        const dragBy = async (delta: number): Promise<void> => {
            const { x, y, width, height } = separator.getBoundingClientRect();
            const start = { x: x + width / 2, y: y + height / 2 };
            await user.pointer([
                { target: separator, keys: "[MouseLeft>]", coords: start },
                { coords: { ...start, x: start.x + delta } },
                { keys: "[/MouseLeft]" },
            ]);
        };

        await dragBy(-50);
        await waitFor(() => expect(handle.getSize().inPixels).toBeCloseTo(100));
        expect(mainContent.getBoundingClientRect().width).toBeCloseTo(initialContentWidth + 50);
        await dragBy(-36);
        await waitFor(() => expect(handle.getSize().inPixels).toBeCloseTo(64));
        await dragBy(-36);
        await waitFor(() => expect(handle.getSize().inPixels).toBe(0));
        await dragBy(40);
        await waitFor(() => expect(handle.getSize().inPixels).toBeCloseTo(64));
    });

    it("should be inert when collapsed", () => {
        renderPanel({ isCollapsed: true });
        const panel = screen.getByTestId(LEFT_PANEL_ID);
        expect(panel.getAttribute("inert")).not.toBeNull();
    });
});
