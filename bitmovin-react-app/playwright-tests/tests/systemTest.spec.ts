import { expect, test } from "@playwright/test";

import SystemTest from "@pages/systemTest";
import SystemTestPage from "@constants/systemTestPage";

let systemTestPage: SystemTest;

test.beforeEach(async ({page}) => {
    systemTestPage = new SystemTest(page);
});

test.describe("Basic test for the suite to make sure it has been set up properly", async () => {
    
    test.beforeEach(async () => {
        await systemTestPage.goToPage();
    });

    test.afterEach(async () => {
        systemTestPage.closePage();
    });

    test("Bring up the system test page", async () => {
        expect(await systemTestPage.getTitleText()).toEqual(SystemTestPage.TITLE);
    });

    test("Stop and start video", async () => {
        await systemTestPage.unpauseVideo();
        await systemTestPage.pauseVideo();
    });
});