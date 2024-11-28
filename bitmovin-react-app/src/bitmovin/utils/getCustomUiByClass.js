
const globalCssPrefix = 'bmpui-';
const customClass = 'globalmeet-custom-class';
const customClassComplete = globalCssPrefix + customClass;

export const getCustomUiElements = () => {
    let uiElements = document.getElementsByClassName(customClassComplete);
    console.log('Starting getCustomUiElements with ' + uiElements.length + ' elements');
    for (let i = 0; i < uiElements.length; i++) {
        let elementId = uiElements[i].id;
        console.log('element = ' + elementId);
      }
      console.log('Finishing getCustomUiElements');
}