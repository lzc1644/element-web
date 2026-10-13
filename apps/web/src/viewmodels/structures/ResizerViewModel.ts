/*
 * Copyright 2026 Element Creations Ltd.
 *
 * SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
 * Please see LICENSE files in the repository root for full details.
 */

import {
    BaseViewModel,
    type LeftResizablePanelViewActions,
    type SeparatorViewActions,
    type PanelSize,
    type PanelImperativeHandle,
    type GroupViewActions,
    type ResizerViewSnapshot,
} from "@element-hq/web-shared-components";
import { type PointerEvent } from "react";

import SettingsStore from "../../settings/SettingsStore";
import { SettingLevel } from "../../settings/SettingLevel";
import { AutoCollapse } from "./auto-collapse/AutoCollapse";
import { type CallStore } from "../../stores/CallStore";

function getSavedPanelSize(): number | string | undefined {
    const width = SettingsStore.getValue("RoomList.panelWidth");
    return width === null ? (SettingsStore.getValue("RoomList.panelSize") ?? undefined) : `${width}px`;
}

function getInitialState(): ResizerViewSnapshot {
    const shouldStartCollapsed =
        SettingsStore.getValue("RoomList.isPanelCollapsed") || AutoCollapse.shouldStartCollapsed();
    if (shouldStartCollapsed) {
        return {
            isCollapsed: true,
            initialSize: 0,
        };
    }
    return {
        isCollapsed: false,
        initialSize: getSavedPanelSize(),
    };
}

/**
 * Viewmodel that drives the resizable left panel.
 */
export class ResizerViewModel
    extends BaseViewModel<ResizerViewSnapshot, void>
    implements SeparatorViewActions, LeftResizablePanelViewActions, GroupViewActions
{
    /**
     * This object gives us access to the API methods of react-resizable-panels library.
     */
    private panelHandle?: PanelImperativeHandle;

    /**
     * Needed to distinguish between a drag and a click on the separator.
     */
    private readonly mouseClickHandler: MouseClickHandler;

    /**
     * Orchestrator for auto collapse behaviour.
     */
    private readonly autoCollapse: AutoCollapse;

    public constructor(callStore: CallStore) {
        super(undefined, getInitialState());

        // Run onSeparatorClick when the separator is clicked.
        this.mouseClickHandler = new MouseClickHandler(this.onSeparatorClick);
        this.autoCollapse = this.disposables.track(
            new AutoCollapse(
                this.restorePanel,
                () => {
                    this.panelHandle?.collapse();
                    this.snapshot.merge({ isCollapsed: true });
                },
                callStore,
            ),
        );
    }

    public onLeftPanelResize = (panelSize: PanelSize): void => {
        this.snapshot.merge({ isCollapsed: panelSize.inPixels === 0 });
    };

    public onLeftPanelResized = (newSize: number, isUserInteraction: boolean): void => {
        // Window resizing, constraints and automatic collapse must not overwrite the user's width.
        if (!isUserInteraction || this.autoCollapse.shouldIgnoreResize) return;

        this.autoCollapse.onLeftPanelResized();
        this.persistPanelSize(newSize === 0);
    };

    private persistPanelSize = (isCollapsed: boolean): void => {
        if (!isCollapsed) {
            const width = this.panelHandle?.getSize().inPixels;
            if (width !== undefined) {
                void SettingsStore.setValue("RoomList.panelWidth", null, SettingLevel.DEVICE, width);
            }
        }
        // Keep the last usable width separately so a collapsed panel can restore it after reload.
        void SettingsStore.setValue("RoomList.isPanelCollapsed", null, SettingLevel.DEVICE, isCollapsed);
    };

    public setPanelHandle = (handle: PanelImperativeHandle): void => {
        this.panelHandle = handle;
    };

    private restorePanel = (): void => {
        if (this.panelHandle?.isCollapsed()) {
            const size = getSavedPanelSize();
            this.panelHandle.resize(typeof size === "number" ? `${size}%` : (size ?? "370px"));
        }
    };

    private onSeparatorClick = (): void => {
        if (!this.panelHandle) return;

        if (this.panelHandle.isCollapsed()) {
            this.restorePanel();
        } else if (Math.round(this.panelHandle.getSize().inPixels) <= 64) {
            // A single click on the avatar-only separator restores the full layout.
            this.panelHandle.resize("370px");
            void SettingsStore.setValue("RoomList.panelWidth", null, SettingLevel.DEVICE, 370);
        } else {
            return;
        }
        this.autoCollapse.onLeftPanelResized();
        // Imperative resizing is applied on the next render, so persist the user's intent, not the old handle state.
        void SettingsStore.setValue("RoomList.isPanelCollapsed", null, SettingLevel.DEVICE, false);
    };

    public onDoubleClick = (): void => {
        if (this.panelHandle && !this.panelHandle.isCollapsed()) {
            this.panelHandle.collapse();
            this.autoCollapse.onLeftPanelResized();
            this.persistPanelSize(true);
        }
    };

    public onPointerUp = (): void => {
        this.mouseClickHandler.onPointerUp();
    };

    public onPointerMove = (event: PointerEvent): void => {
        this.mouseClickHandler.onPointerMove(event.clientX, event.clientY);
    };

    public onPointerDown = (event: PointerEvent): void => {
        this.mouseClickHandler.onPointerDown(event.clientX, event.clientY);
    };
}

/**
 * How far the pointer may travel between going down and coming up and still count as a click rather
 * than a drag. A trackpad rarely holds a pointer perfectly still, and a separator that only opens on
 * a pixel-perfect click reads as one that ignores clicks.
 */
const CLICK_TOLERANCE_PX = 5;

/**
 * Dragging the separator will emit a click event.
 * This class uses pointer event handlers to distinguish between a drag and a click
 * on the separator.
 */
class MouseClickHandler {
    public constructor(private readonly onClick: () => void) {}

    /** Where the pointer went down, for as long as it is down. */
    private origin: { x: number; y: number } | null = null;
    private isResize = false;

    public onPointerUp = (): void => {
        this.origin = null;
        if (!this.isResize) this.onClick();
    };

    public onPointerDown = (x: number, y: number): void => {
        this.origin = { x, y };
        this.isResize = false;
    };

    public onPointerMove = (x: number, y: number): void => {
        // Moving across the separator with no button held is not a drag, and must not be allowed to
        // spend the next click.
        if (!this.origin) return;

        if (Math.abs(x - this.origin.x) > CLICK_TOLERANCE_PX || Math.abs(y - this.origin.y) > CLICK_TOLERANCE_PX) {
            this.isResize = true;
        }
    };
}
