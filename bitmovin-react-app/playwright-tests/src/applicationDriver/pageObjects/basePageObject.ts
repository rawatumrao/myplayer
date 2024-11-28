import { Page } from "@playwright/test";

export default class BasePageObject {
    constructor(protected page: Page) {

    }

    /**
    * Closes the page out 
    */
    public async closePage() {
        await this.page.close();
    }
}