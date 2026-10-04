/*
Copyright 2026 lzc1644

SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE in the repository root for full details.
*/

import type { IBaseSetting } from "../settings/Settings.tsx";

declare module "../settings/Settings.tsx" {
    interface Settings {
        /** Setting used by controller tests, shared by unit and browser type checks. */
        test_setting: IBaseSetting<string>;
    }
}
