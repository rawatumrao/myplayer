
const globalCssPrefix = 'bmpui-';
const testTaggerClass = 'tagging-test-class';
const testTaggerClassComplete = globalCssPrefix + testTaggerClass;

export const testTagger = () => {
    let uiElements = document.getElementsByClassName(testTaggerClassComplete);
    //console.log('Starting testTagger with ' + uiElements.length + ' elements');
    for (let i = 0; i < uiElements.length; i++) {
        let elementId = uiElements[i].id;
        //console.log('elementId = ' + elementId);
        uiElements[i].setAttribute("data-testid", elementId);
      }
      //console.log('Finishing testTagger');
}