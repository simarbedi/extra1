let puppeteer = require("puppeteer")
let fs = require("fs")
let credentialsFile = process.argv[2];
(async function(){
    let data = await fs.promises.readFile(credentialsFile,"utf-8");
    let credentials = JSON.parse(data);
    login_link = credentials.website;
    location = credentials.location;
    minValue = credentials.minValue;
    maxValue = credentials.maxValue;

    let browser = await puppeteer.launch({
        headless:false,
        defaultViewport:null,
        args:["--start-maximized"]
    })
    let numberofPages = await browser.pages();
    let tab = numberofPages[0];

    await tab.goto(login_link, {
        waitUntil: "networkidle2"
    });

    await tab.waitForSelector("#keyword");                                                   // property location
    await tab.type("#keyword",location,{delay:100});

    await tab.waitForSelector("#propType_holder_div_buy .propertyTypeArrow");                 // property type arrow
    await tab.click("#propType_holder_div_buy .propertyTypeArrow");

    await tab.waitForSelector("#propType_buy_span_10002_10003_10021_10022");                 // property type flats option 
    await tab.click("#propType_buy_span_10002_10003_10021_10022");

    await tab.waitForSelector("#propType_buy_chk_10001_10017");                              // property type house
    await tab.click("#propType_buy_chk_10001_10017");

    await tab.waitForSelector("#bhk_11702");                                                 // property type 3BHK
    await tab.click("#bhk_11702");

    await tab.waitForSelector("#bhk_11703");                                                 // property type 4BHK
    await tab.click("#bhk_11703");

    await tab.waitForSelector("#buy_budget_holder .propertyTypeArrow.toggleBudgetList");     // budget list arrow
    await tab.click("#buy_budget_holder .propertyTypeArrow.toggleBudgetList");

    await tab.waitForSelector(".rangeOption #rangeMinLinkbudgetBuyinput");                   // minimum budget
    await tab.type(".rangeOption #rangeMinLinkbudgetBuyinput",minValue,{delay:100});

    await tab.waitForSelector(".rangeOption #rangeMaxLinkbudgetBuyinput");                   // maximum budget
    await tab.type(".rangeOption #rangeMaxLinkbudgetBuyinput",maxValue,{delay:100});

    await tab.waitForSelector("#btnPropertySearch");                                        // property search
    await navigationHelper(tab, "#btnPropertySearch");

    let result = await tab.evaluate(() => {
		let properties = Array.from(
			document.querySelectorAll('.flex.relative.clearfix.m-srp-card__container')
		);
		return properties.map((property) => {
			let propertyName = property.querySelector(".m-srp-card__title__bhk").innerText;
			let societyName = property.querySelector(
				".m-srp-card__title"
			).innerText;
			let price = property.querySelector(".m-srp-card__price").innerText;
			let description = property.querySelector(".m-srp-card__description")
				.innerText;
			return {
				propertyName,
				societyName,
				price,
				description,
			};
		});
	});

	console.log(result);

    await fs.promises.writeFile(
		"LatestProperty.JSON",
		JSON.stringify(result, null, 4)
	);
  

    console.log("All Properties processed");
    
    
})();

async function navigationHelper(tab, selector) {
    await Promise.all([tab.waitForNavigation({
        waitUntil: "networkidle2"
    }), tab.click(selector)]);
}