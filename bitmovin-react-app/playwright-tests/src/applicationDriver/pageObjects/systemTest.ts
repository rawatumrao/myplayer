import { convertTypeAcquisitionFromJson } from "typescript";
import BasePageObject from "./basePageObject";

// #pageContent > h1

const TITLE_LOCATOR = "#pageContent > h1";
const FRAME_LOCATOR = 'iframe[name="videotest"]';
const VIDEO_PLAYER_CONTROLS_LABEL = 'Video player controls';
const PLAY_VIDEO_LABEL = 'Play';
const PAUSE_VIDEO_LABEL = 'Pause';

const SYSTEM_PAGE_PATH = "viewer/faq.jsp?mType=v&closebtn=no&useHtml5Slide=true&ishtml5player=true";
const SYSTEM_TEST_PAGE_URL: string = process.env.ROOT_URL + SYSTEM_PAGE_PATH;

export default class SystemTest extends BasePageObject {

    public async goToPage() {
        await this.page.goto(SYSTEM_TEST_PAGE_URL);
    }

    public async getTitleText(): Promise<string> {
        return await this.page.locator(TITLE_LOCATOR).innerText();
    }

    public async unpauseVideo() {
        const meow = this.page.frameLocator(FRAME_LOCATOR);
        const woof = meow.getByLabel(VIDEO_PLAYER_CONTROLS_LABEL);
        await woof.hover();
        await woof.getByLabel(PLAY_VIDEO_LABEL, { exact: true }).click();
        await this.page.frameLocator(FRAME_LOCATOR).getByLabel(VIDEO_PLAYER_CONTROLS_LABEL).hover();
        await this.page.mouse.down();
        return await this.page.frameLocator(FRAME_LOCATOR).getByLabel(VIDEO_PLAYER_CONTROLS_LABEL).getByLabel(PLAY_VIDEO_LABEL, { exact: true }).click();
    }

    public async pauseVideo() {
        await this.page.frameLocator(FRAME_LOCATOR).getByLabel(VIDEO_PLAYER_CONTROLS_LABEL).hover();
        return await this.page.frameLocator(FRAME_LOCATOR).getByLabel(VIDEO_PLAYER_CONTROLS_LABEL).getByLabel(PAUSE_VIDEO_LABEL).click();
    }
}