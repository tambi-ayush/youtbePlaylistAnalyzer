let fs=require('fs');
let puppeteer=require('puppeteer');

(async function fn(){
    let browser=await puppeteer.launch({headless:false,defaultViewport:null, args: ["--start-maximized", "--disable-notifications"]})
    let page=await browser.newPage();
    await page.goto("https://www.youtube.com/playlist?list=PLzkuLC6Yvumv_Rd5apfPRWEcjf9b1JRnq");
    await page.waitForSelector('h1[id="title"]');
    let element=await page.$('h1[id="title"]');
    let playlistName=await page.evaluate(
        function(element){
            return element.textContent;
        },element);
    console.log("Title of playlist is "+playlistName);
    await page.waitForSelector(".style-scope.ytd-playlist-sidebar-primary-info-renderer");
    let elemArr=await page.$$(".style-scope.ytd-playlist-sidebar-primary-info-renderer");
    let videosCount=await page.evaluate(
        function(element){
            return element.textContent;
        },elemArr[5]);
    console.log(""+videosCount);
    let viewsCount=await page.evaluate(
        function(element){
            return element.textContent;
        },elemArr[6]);
    console.log(""+viewsCount);
    ///
    let table=[];
    let videos=videosCount.split(" ")[0].trim();
    let loopcount = Math.floor(videos / 100);

    for (let i = 0; i < loopcount; i++) {
        // load start
        await page.click(".circle.style-scope.tp-yt-paper-spinner");
        // load finish
        await waitTillHTMLRendered(page);
        console.log("loaded the new videos");
    }
    // loader -> scroll 
        //await page.waitForSelector("#video-title");
        //await page.waitForSelector(".style-scope.ytd-thumbnail-overlay-time-status-renderer");
        let titleArr=await page.$$("#video-title");
        let timeArr=await page.$$(".style-scope.ytd-thumbnail-overlay-time-status-renderer");
        let lastVideo = titleArr[titleArr.length- 1];
        // last video -> view
        await page.evaluate(function(elem) {
            elem.scrollIntoView();
         }, lastVideo);
            let min=0;
            let sec=0;
         for(let i=1;i<titleArr.length;i++){
                let title=await page.evaluate(
                    function(element){
                        return element.textContent;
                    },titleArr[i-1]);
                let time=await page.evaluate(
                    function(element){
                        return element.textContent;
                    },timeArr[(i*2)-1]);
                min+=Number(time.split("'")[0].split(":")[0]);
                sec+=Number(time.split("'")[0].split(":")[1]);
            table.push({"videoNo":i,"videoTitle":title.trim(),"time":time.trim()});
         }
         
         sec+=min*60;
         let hr=Math.floor(sec/3600);
         min=sec%3600;
         min=Math.floor(min/60);
         sec=min%60;
          console.log("playlist length is "+hr+" Hours "+min+" Minutes "+sec+" Seconds long");
    console.table(table);
})()

const waitTillHTMLRendered = async (page, timeout = 10000) => {
    const checkDurationMsecs = 1000;
    const maxChecks = timeout / checkDurationMsecs;
    let lastHTMLSize = 0;
    let checkCounts = 1;
    let countStableSizeIterations = 0;
    const minStableSizeIterations = 3;

    while (checkCounts++ <= maxChecks) {
        let html = await page.content();
        let currentHTMLSize = html.length;

        let bodyHTMLSize = await page.evaluate(() => document.body.innerHTML.length);

        //console.log('last: ', lastHTMLSize, ' <> curr: ', currentHTMLSize, " body html size: ", bodyHTMLSize);

        if (lastHTMLSize != 0 && currentHTMLSize == lastHTMLSize)
            countStableSizeIterations++;
        else
            countStableSizeIterations = 0; //reset the counter

        if (countStableSizeIterations >= minStableSizeIterations) {
            //console.log("Page rendered fully..");
            break;
        }

        lastHTMLSize = currentHTMLSize;
        await page.waitFor(checkDurationMsecs);
    }
};

// function getText(page,selector){

// }

//h1[id='title']
//video style-scope ytd-playlist-video-list-renderer
//#video-title