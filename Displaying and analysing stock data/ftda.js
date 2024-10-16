/* Constant data that helps keep the page running on rails */
const textContentPages = [
    `Financial market crashes are part and parcel of our post-globalised world, and many experts view them as essential for a robust economy. Whilst they are uncontrollable, they can be forecasted using topology (the "study of surfaces"). A "Topologist" sees a flat piece of paper and a rolled piece of paper as the same thing, while a geometrist would say "hey, that's not a rectangle anymore, that's a cylinder!". Ripping the page alters its topology, but only if you take pleasure in making two mathematicians cry.
    
    What if we consider the correlations between stocks as a surface? During a financial crash, no one escapes- everyone's stocks go down. Surely, there must be a noticeable difference between the 'normal' surface of chaos that is stock trading and the universal drop that is a crash, right?
    
    On the right, you'll see the stocks within the Dow Jones Industrial Average connected together to make a 2D surface. The colour of each connection indicates how strong the correlation between the two stocks is (brighter is stronger). This simulation is running data between January 2008-January 2009. Press the button to see it in action!
    
    Can you spot when the infamous September 29th, 2008 financial crash occurs?`,

    `It wouldn't be any fun if you couldn't input your own data.
    
    Enter any NYSE ticker (<a href="https://www.nyse.com/listings_directory/stock" target="_blank">here's a list</a>) followed by a newline to draw your own custom topology. You can also edit the date range of stock data in the box above. This website is actually fetching live NYSE stock data, so you can go all the way up to today. 
    
    Why not analyse another market crash, like the one in March 2020?`,

    `This visualisation lets us see financial crashes very clearly, but what's even more amazing is topology lets us predict financial crashes based on previous correlation data.
    
    Using a technique called persistent homology, we can filter out correlations below a certain threshold and analyse the resulting shape. Astonishingly, this gives us a really strong idea as to whether a given portfolio is approaching a 'significant global shift', which means the portfolio is about to go up or down drastically. This isn't a perfect science as the stock market is all but random, however with the help of machine learning and some correlation analysis we can obtain some surprisingly solid results.
    
    I connected a model trained on this extracted data to this website- enter a stock portfolio of your choice, and get a topology-based prediction of whether it's about to experience a significant global shift.`
];

const secondaryHTMLContent = [
    `
    <div class="secondaryInput">
        Start Date:
        <input style="font-family: Windows95, sans-serif;" id="startDate" value="2008-01-01" placeholder="Format: YYYY-MM-DD"/>
        End Date:
        <input style="font-family: Windows95, sans-serif;" id="endDate" value="2009-01-01"/ placeholder="Format: YYYY-MM-DD">
    </div>
    <button 
    class="canvasButton" 
    id="stockAnalysisButton" 
    onclick="showTopologyAnimation()">
        Simulate NYSE activity
    </button>
    `,

    `
    <div class="secondaryInput">
        Start Date:
        <input style="font-family: Windows95, sans-serif;" id="startDate" value="2008-01-01" placeholder="Format: YYYY-MM-DD"/>
        End Date:
        <input style="font-family: Windows95, sans-serif;" id="endDate" value="2009-01-01"/ placeholder="Format: YYYY-MM-DD">
    </div>
    <button 
    class="canvasButton" 
    id="stockAnalysisButton" 
    onclick="showTopologyAnimation()">
        Simulate NYSE activity
    </button>
    `,
    `<div></div>`
];

let tickers = [ // Begin with the Dow Jones Industrial Average, allowing users to specify their own list of stocks if they wish. 
    'MMM', 
    'AA', 
    'AXP', 
    'T', 
    'BAC', 
    'BA', 
    'CAT', 
    'CVX', 
    'C', 
    'KO', 
    'DD', 
    'XOM', 
    'GE', 
    'HPQ', 
    'HD', 
    'HON', 
    'IBM', 
    'INTC', 
    'JNJ', 
    'JPM', 
    'MCD', 
    'MRK', 
    'MSFT', 
    'PFE', 
    'PG', 
    'VZ', 
    'WMT', 
    'DIS'
];

let currentTextPage = 0;
/* End of constants. */

/* Functions that handle navigation and page content. */

function navigateToNewTextContent(targetPageIndex){
    /* Function logic:
        * Actually quite simple! The arrays secondaryHTMLContent and textContentPages store
          the data to be loaded for each page, and the innerHTML for the corresponding HTML
          elements are set to these array elements each time a navigation button is pressed.
        * I use a single number to track the current page. Pressing the "Forward" button 
          increases this number, and pressing "Back" decreases it. This number is then used
          as an index to load the corresponding content. I take the modulus of this number,
          so that pressing "Forward" on the last page returns a user to the first page 
          (and pressing "Back" on the first page takes a user to the last page).
     */
    clearQueuedTimeouts(); // Prevents a "glitch" effect if navigation buttons are spammed.
    document.getElementById('ftda-text-content').innerHTML = ""; // Clear the text instead of waiting for it to be removed letter-by-letter.
    var newTextPageIndex = (currentTextPage + targetPageIndex) % textContentPages.length; // Modular arithmatic makes a loop instead of a line.
    updateWithFlair(textContentPages[newTextPageIndex], 'ftda-text-content');
    updateSecondaryContent(newTextPageIndex);
    clearStockTopology();
    if (newTextPageIndex != 2) { // The only page we don't want to see the topology drawing on is the last page (with index 2).
        setMaxDateToToday();
        ftdaCanvasTextArea = document.getElementById('ftda-canvas-textarea');
        ftdaCanvasTextArea.innerHTML = ""; // Clear the data inside of the stock list, making it nice and clean for when we start over.
        for (let tickerNumber = 0; tickerNumber < tickers.length; tickerNumber++) {
            ftdaCanvasTextArea.innerHTML += tickers[tickerNumber] + "\n";
        }
        drawStockTopology(tickers.length);
    }
    currentTextPage = newTextPageIndex;
}

function updateSecondaryContent(index) {
    /* Function logic:
        * A mirror of navigateToNewTextContent. I wrote a separate function here just
          to keep things clearer and follow good OOP principles.
     */
    const secondaryInputElement = document.getElementById('secondaryContent');
    if (secondaryInputElement) {
        secondaryInputElement.innerHTML = secondaryHTMLContent[index];
    } else {
        console.error('Element with ID "secondaryInput" not found.');
    }
}

/* End of navigation functions. */

/* Functions that draw the stock topology. The "stock topology" is the series of interconnected lines that appears in the blue box. */

async function drawStockTopology(numPoints) {
    /* Function logic: 
        * drawStockTopology has to work out two things; firstly, if I have n points and want to draw a neat polygon, how far away
          should each vertex be from one another? Secondly, how long is each vertex edge?
        * We take advantage of a nice theorem in mathematics that says the vertices of a neat (or "regular") polygon are always
          points on a circle. This means that we can start by pretending we're drawing a circle and adding the vertices at regular
          intervals (according to the number of points). Once we've done this, we can use GCSE circle theorems to work out the 
          distance between each vertex. Who said you'll never use the maths you learned in school?
    */
    const ftdaCanvas = document.getElementById("ftda-canvas");
    const squareSideLength = 6; // Sets the size of the vertices drawn in the topology, which appear as squares. 6 is good for all screen sizes.
    const centre_x = ftdaCanvas.clientWidth / 2;
    const centre_y = ftdaCanvas.clientHeight / 2;
    const radius = Math.min(centre_x, centre_y) * 0.8;  // We choose the radius of the topology as the smallest of the height or width so that the drawing always fits inside the client's canvas. We then reduce it by 20% so that it's snug inside the box, not lapping at the corners.
    const angleDelta = 2 * Math.PI / numPoints; // The angle between two neighbouring vertices on the circle. For a square, this would be 90 degrees (or π/2 "radians"). For a hexagon, it's 60 degrees, and so on.
    const cpd = Math.min(radius, angleDelta * radius); // C.P.D. - constant point distance. Sets the distance between each vertex in the topology.
    let previousPoint = [
        centre_x + cpd / 2, // We don't want a point in a polygon with a low number of points to be in the centre- the shape ends up partially off-screen. Adding the CPD to the starting point (which acts as a reference for the rest of the code) offsets the shape so that it's in the middle of the screen. As we add more points, the CPD decreases and a more circle-like shape tends towards the centre.
        centre_y - radius // Likewise, we don't want the origin point to be in the centre of the canvas. We want it to be at the top, so we can draw our circle in a clockwise direction.
    ]; 
    let pointArray = [previousPoint];
    
    function drawPoint(i) {
        /* Function logic: 
            * Most of this code is boilerplate (thanks w3.org!) and draws the vertices as part of an animation. This is far less jarring
              than having them simply jump onto screen, and gives the user a nice "ooh" moment.
            * The only (slightly) complicated part of code is the part that determines the next point on the circle. 
              A circle of radius r is defined as all the points that satisfy r * [ sin(a)**2 + cos(a)**2 ] = r. So,
              when we want to go around a circle by an angle of b, we have to add sin(a - b) to our x coordinate
              and cos(a - b) to our y coordinate. In the code below, we use the fact that multiplying a number by n is the same
              as adding it up n times (or taking n steps around the circle) so for each i, we take an extra step that's the same
              size as angleDelta. Phew.
            * Finally, the function recursively draws each vertex until it iterates up to i, and then hands off drawing the
              connecting lines to drawConnections.
        */
        if (i <= numPoints) {
            const nextPoint = [
                previousPoint[0] + cpd * Math.cos(angleDelta * i),
                previousPoint[1] + cpd * Math.sin(angleDelta * i)
            ];
            const newSVGPoint = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            newSVGPoint.setAttributeNS(null, 'x', nextPoint[0] - squareSideLength / 2);
            newSVGPoint.setAttributeNS(null, 'y', nextPoint[1] - squareSideLength / 2);
            newSVGPoint.setAttributeNS(null, 'height', squareSideLength);
            newSVGPoint.setAttributeNS(null, 'width', squareSideLength);
            ftdaCanvas.appendChild(newSVGPoint);
            pointArray.push(nextPoint);
            previousPoint = nextPoint;
            requestAnimationFrame(() => drawPoint(i + 1)); // Recursive part.
        } else {
            drawConnections(0);
        }
    }
    
    function drawConnections(i) {
        /* Function logic:
            * Mostly boilerplate code here to draw SVG lines between each possible point. We extract each point from the array
              kindly generated for us by drawPoint.
            * We give each connection an ID so we can come back and later change its colour depending on how correlated its two
              connecting stocks are. The ID set has to be concise and clear, so it's the internal array index of each stock 
              separated by a hyphen. For example, the line that connects the first and fifth stock in the array is called "0-4".
         */
        if (i < numPoints) {
            const originPoint = pointArray[i];
            for (let j = i; j < numPoints; j++) {
                const destinationPoint = pointArray[j];
                if (originPoint !== destinationPoint) {
                    const newSVGConnection = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    const pathString = "M " + destinationPoint[0] + "," + destinationPoint[1] + " L " + originPoint[0] + "," + originPoint[1];
                    const pathID = i.toString() + "-" + j.toString();
                    newSVGConnection.setAttributeNS(null, 'd', pathString);
                    newSVGConnection.setAttributeNS(null, 'stroke', 'black');
                    newSVGConnection.setAttributeNS(null, 'id', pathID);
                    ftdaCanvas.appendChild(newSVGConnection);
                }
            }
            requestAnimationFrame(() => drawConnections(i + 1));
        }
    }
    drawPoint(1); // The recursion begins...
}

function clearStockTopology() {
    /* Function logic:
        * Simple boilerplate code here. Delete the drawn topology so we can draw a new one.
     */
    const svg = document.getElementById("ftda-canvas");
    if (svg) { 
        svg.parentNode.replaceChild(svg.cloneNode(false), svg);
    }
}

/* End of functions that draw the topology. */

/* Functions to stop user inputs creating unexpected site behaviour. */

function setMaxDateToToday() {
    /* Function logic:
        * I prevent an end user requesting stock data from the future (sorry guys). 
          If a user enters a date beyond today, their input is changed to today's date.
     */
    const d = new Date();
    const dateToday = d.getFullYear().toString() + "-" +d.getMonth().toString() + "-" + d.getDate().toString();
    document.getElementById("startDate").max = dateToday;
    document.getElementById("endDate").max = dateToday;
}

function sanitiseTextInput(textInput) {
    /* Function logic:
        * People are the worst, right? There's always someone trying to use a XSS attack on your website.
          This function stops users entering code to execute within the ticker symbol input textarea.
          It only allows users to enter alphabetic characters, so key code syntax like ;, () and $ 
          won't be accepted. If a user tries this, the website won't even try to get the stock data requested.
     */
    if (textInput.match(/^[A-Za-z]+$/)) { // Removes some basic attempts to inject malicious code via the text input, you naughty sausage.
        return textInput; // All good!
    } else {
        return null; // Naughty.
    }
}

function filterOutNullTickers(tickerList) {
    /* Function logic:
        * I found through testing that people would often press "Enter" after entering their list of tickers.
          The consequence of this is that the website would request data for a ticker called "" because it sees
          an empty line at the bottom of the textarea. I decided to cover all my bases and go through the entire
          input line-by-line, removing empty strings.
     */
    var i = 0;
    while (i < tickerList.length) {
        if (tickerList[i] === '') {
            tickerList.splice(i, 1);
        } else {
            ++i;
        }
    }
    return tickerList;
}

/* End of user input handling functions. */

/* Functions to download requested stock data. */

async function updateEverythingWithNewTickers() {
    /* Function logic:
        * Downloading data, doing more correlation analysis, all this takes time!
          We want to first ensure that our list of tickers has actually changed since
          the last time we analysed them, otherwise we're asking the user to wait a 
          long time just to replay an animation.
        * To do this, I take in the data within the input textarea, sanitise it, and
          compare it to the internally stored list of tickers that was last used for 
          analysis. If they're the same, I just replay the cached animation. If not,
          I send the new data off for analysis.
    */
    const newTickers = document.getElementById('ftda-canvas-textarea').value;
    let newTickerList = newTickers.split("\n");
    newTickerList = filterOutNullTickers(newTickerList); // Removes the lingering empty string that .split() insists on giving a home.
    const sanitisedNewTickerList = newTickerList.map( (ticker) => sanitiseTextInput(ticker) );
    if (checkArrayEquality(tickers, sanitisedNewTickerList)){
        return false;
    } else{
        tickers = sanitisedNewTickerList;
        return true;
    }
}

function checkArrayEquality(a, b) {
    /* Function logic:
        * Simply check if the list of tickers in the textarea is the same as the interally stored list.
          The eagle-eyed reader may notice that changing the order of tickers without changing the tickers
          themselves will cause this function to return false- this is intended behaviour, because if we 
          move the order of tickers about we have to move the vertices in the drawn stock topology.
     */
    return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index]);
}

function getStockData(data={}) {
    /* Function logic:
        * Launch a simple POST request to my serverless endpoint. 
          I take a "trust the user" approach- if you ask for an invalid ticker,
          you'll get a null object which is just a black dot and lines in the
          end topology.
     */
    return fetch("https://portfolio-website-functions.vercel.app/getStockData", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    })
    .then(response => response.text()); // parses JSON response into native JavaScript objects 
}

function whileDownloading() {
    /* Function logic:
        * Sometimes downloads take a hot minute, and an unresponsive webpage makes the user
          think something's broken. To keep their interest, I implemented this status 
          indicator that uses a retro-style ellipsis (...) that moves using setTimeout.
     */
    const displayTexts = ["Downloading data..", "Downloading data...", "Downloading data."]; // Array of strings to display
    let index = 0;
  
    const intervalId = setInterval(() => {  // Create the interval and store its ID
      stockAnalysisButton.innerHTML = displayTexts[index];  // Display the current text
      index = (index + 1) % displayTexts.length;  // Update the index to cycle through the texts
    }, 250);  // Change the interval time as needed.
    return intervalId;  // Return the interval ID so it can be cleared later
}
  
function downloadComplete(intervalId) {
    /* Function logic:
        * whileDownloading starts a setTimeout "animation" of refreshing texts. This just stops that animation.
     */
    clearInterval(intervalId);
}

/* End of stock data download functions. */

/* Functions to handle and prepare downloaded stock data for analysis. */

function convertTextResponseToMatrix(textResponse) {
    /* Function logic:
        * The Python serverless function returns a text response, but the
          C++ WebAssembly function wants to analyse a matrix of numbers.
          Here, I convert the text-based stock value data into a nested 
          list of numbers which acts as an array.
    */
    matrix = textResponse.split(']'); // Python uses square brackets to store the nested text response, so I'll get rid of these.
    for (let i = 0; i < matrix.length; i++) {
        matrix[i] = matrix[i].replaceAll('[', ''); // Once again, just removing Pythonic formatting.
        matrix[i] = matrix[i].split(',').map(stockPrice => parseFloat(stockPrice)); // Turn each text element into a number, please.
        if (i > 0) {
            matrix[i].splice(0, 1); // Removes the first element of the new array, which is a trailing comma from the original Python list.
        }
    }
    return matrix;
}

async function generateStockMatrix(startDate, endDate) {
    /* Function logic:
        * The functions defined above are individualistic- so this function brings them together under one roof.
          Here, I request the data and convert it into a matrix all at once.
     */
    let tickersAsString = "";
    for (var i = 0; i < tickers.length; i++) {
        tickersAsString += tickers[i];
        if (i < tickers.length - 1) {
            tickersAsString += " ";
        }
    }
    const textResponse = await getStockData({
        'ticker':tickersAsString,
        'startDate':startDate,
        'endDate':endDate
    });
    const matrix = convertTextResponseToMatrix(textResponse);
    return matrix;
}

/* End of stock data preparation. */

/* Functions to run Pearson's Correlation on stock data using WebAssembly. */

function getArrayHeapPointer(array) {
    /* Function logic:
        * Oh boy. C++ in WebAssembly requires explicit memory assignment and management, which JavaScript does not do well.
          I tell WebAssembly to reserve a spot in memory for all that C++ goodness and also to let JavaScript access that memory.
          This creates a back-and-forth "drop zone" that allows C++ to send and receive data to and from JS.
        * However, how can we access this from JavaScript? A piece of C++ memory cannot be a JavaScript variable because JavaScript
          is constantly resizing and moving and messing with pretty much everything in its memory. So, we store the location of the
          C++ memory as a JavaScript constant called heapPointer. This way, we always know how to get to this special C++ zone.
        * Even though this function is called getHeapPointer, it actually begins by setting a pointer for a given array. This means
          it takes information from a JS array and converts it into a f32 C++ vector format, and then returns the pointer.
          Calling it setArrayHeapPointer kept confusing me because of how I later use the function.
     */
    const typedArray = Float32Array.from(array);
    const heapPointer = Module._malloc( // _malloc = "memory allocate".
      typedArray.length * typedArray.BYTES_PER_ELEMENT // I have to tell _malloc how many bytes large this C++ zone should be, but it's easy to work out.
    );
    Module["HEAPF32"].set(typedArray, heapPointer >> 2); // There's the set! 
    return heapPointer;
}

async function computePearsonCoefficient(firstVector, secondVector) {
    /* Function logic:
        * I now load the stock data into WebAssembly and get that lovely C++ function to start crunching numbers.
          I could have avoided using a matrix and loaded in each pair of stocks one-by-one, but this is so much faster.
        * Although this looks like a lot of complicated work, this method is about 70x faster than computing the correlations with JavaScript. Boom.
     */
    const firstVectorPointer = getArrayHeapPointer(firstVector); // Get the pointers.
    const secondVectorPointer = getArrayHeapPointer(secondVector);
    const coefficient = Module.ccall(
        "computePearsonCoefficient",
        "number",
        ["number", "number", "number"],
        [
            firstVectorPointer, // Load the pointers.
            secondVectorPointer,
            firstVector.length
        ]
    );
    Module._free(firstVectorPointer); // Deallocate the pointers. If you don't do this, you encounter something called "memory leak" which eventually crashes your server.
    Module._free(secondVectorPointer);
    return coefficient;
}

/* End of WebAssembly-related functions. */

/* Functions to update stock topology with colourful lines based on correlation data. */

function correlationToColourmap(correlationCoefficient) {
    /* Function logic:
        * Each correlation value is a number between 0 and 1. How can this become a colour?
          Well, this is what colour actually is! Colour is just a wavelength of light, and
          smaller wavelength makes more "blue" colours. This 1D scale can be used to convert
          small numbers into blue-y colours and larger numbers into red-ish colours.
        * Breaking down a colour into its RGB components makes this process very simple. 
          I use some vector maths to work out the transformation needed to go from one
          colour to another (say, from purple to yellow) and then I add the transformation
          multiplied by the correlation to the base colour and get a result. If the correlation
          is 0.5, then my colour is halfway between purple and yellow. If it's 0.25, it's 
          one quarter yellow, three quarters purple.
     */
    if (isNaN(correlationCoefficient)) {
        correlationCoefficient = 0;
    }
    correlationCoefficient = Math.abs(correlationCoefficient); // A strong negative correlation is as good as a strong positive correlation to us.
    const yellowAsRGB = [255,192,0];
    const purpleAsRGB = [60,0,80]; // #9a00cc
    const red = purpleAsRGB[0] + correlationCoefficient*(yellowAsRGB[0] - purpleAsRGB[0]);
    const green = purpleAsRGB[1] + correlationCoefficient*(yellowAsRGB[1] - purpleAsRGB[1]);
    const blue = purpleAsRGB[2] + correlationCoefficient*(yellowAsRGB[2] - purpleAsRGB[2]);
    return `rgb(` + red + `,` + green + `,` + blue + `)`;
}

async function updateLineColours(stockMatrix) {
    /* Function logic:
        * I now have the colour each line _should_ be, I just now need to go and make that happen.
          But what happens if I do this all at once? The end user just sees the final colour at the 
          final date and doesn't get to appreciate all the nuance of change in between. So, this function
          updates each line with the values from stockMatrix, which is really just a vector of numbers.
          This means for 30 lines, stockMatrix contains 30 numbers.
     */
    const vectorLength = 15;
    let colour = '';

    function updateLineColour(id, colour) { // A function so simple, I defined it inline.
        document.getElementById(id).setAttribute('stroke', colour);
    }

    for (var i = 0; i < tickers.length; i++) {
        for (var j = i + 1; j < tickers.length; j++) {
            colour = await computePearsonCoefficient(
                stockMatrix[i],
                stockMatrix[j],
                vectorLength
            );
            colour = correlationToColourmap(colour);
            if (typeof(colour) === null) {
            }
            const id = (i.toString() + "-" + j.toString()).toString();
            updateLineColour(id, colour);
        }
    }
}

async function showTopologyAnimation() {
    /* Function logic:
        * And finally, we bring it all together under one roof. This is an orchestrator function which 
          brings together everything else already mentioned. Download and analyse the data. Compute the
          correlations. Work out and update the colours. The only thing of note here is that I add a 
          setTimeout to the delay between colour updates on the topology. If I want to make the animation
          faster or slower, I tweak the setTimeout value here.
    */
    const startDate = document.getElementById('startDate').value || '2008-01-01'; // If startDate is blank, default to January 1st 2008.
    const endDate = document.getElementById('endDate').value || '2009-01-01';
    const stockAnalysisButton = document.getElementById("stockAnalysisButton");
    stockAnalysisButton.disabled = true;
    const didStockListUpdate = await updateEverythingWithNewTickers(); // Take the data provided by the user and use that for the analysis.
    if (didStockListUpdate) {
        clearStockTopology();
        drawStockTopology(tickers.length);
    }
    stockAnalysisButton.innerHTML = "Downloading data."
    let animateDownloadButtonIntervalID = whileDownloading();
    const horizon = 15; // A time horizon- this means we compute the correlation between 15 days worth of stock data for each company.
    const bigStockMatrix = await generateStockMatrix(startDate, endDate);
    downloadComplete(animateDownloadButtonIntervalID);
    stockAnalysisButton.innerHTML="Running simulation...";
    const numberOfDays = bigStockMatrix[0].length; // The number of values present in each row is the number of days in the date range that financial data was available for the stocks specified.
    for (let k = 0; k < numberOfDays - horizon - 1; k++){
        const stockMatrix = bigStockMatrix.map( (row) => {
            return row.slice(k, k + horizon)
        });
        await new Promise(resolve => setTimeout(resolve, 70));
        updateLineColours(stockMatrix);
    }
    stockAnalysisButton.disabled = false;
    stockAnalysisButton.innerHTML = "Simulate NYSE activity";
}

/* End of colourful correlation functions. */