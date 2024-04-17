// Global Utility Variables
var data = {};

// Global HTML selectors
var testsubjectidnumber = d3.select("#selDataset");
var demoinfo = d3.select("#sample-metadata");

// Function titleCase from this website:
// https://www.freecodecamp.org/news/three-ways-to-title-case-a-sentence-in-javascript-676a9175eb27/
function titleCase(str) {
    return str.toLowerCase().split(' ').map(function(word) {
        return (word.charAt(0).toUpperCase() + word.slice(1));
    }).join(' ');
}

// Populate the Demographic Info panel
function populatedemoinfo(idNum) {
    // Log a change
    console.log("Pop: " + idNum);

    // Just grab the one ID we want
    var metadatafilter = data.metadata.filter(item => item["id"] == idNum);
    console.log(`metaFilter length: ${metadatafilter.length}`);

    // Clear out the data first
    demoinfo.html("");

    // Fill it back in
    Object.entries(metadatafilter[0]).forEach(([key, value]) => { var titleKey = titleCase(key); demoinfo.append("h6").text(`${titleKey}: ${value}`) });
}

// Object Compare Function
function compareValues(key, order = 'asc') {
    return function innerSort(a, b) {
        if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
            // property doesn't exist on either object
            return 0;
        }
        const varA = (typeof a[key] === 'string')
            ? a[key].toUpperCase() : a[key];
        const varB = (typeof b[key] === 'string')
            ? b[key].toUpperCase() : b[key];
        let comparison = 0;
        if (varA > varB) {
            comparison = 1;
        } else if (varA < varB) {
            comparison = -1;
        }
        return (
            (order === 'desc') ? (comparison * -1) : comparison
        );
    };
}

// Draw the bar plot
function drawBarPlot(idNum) {
    // Log a change
    console.log("Bar: " + idNum);

    // Just grab the one ID we want
    var samplesfilter = data["samples"].filter(item => item["id"] == idNum);
    // console.log(`samplesfilter length: ${samplesfilter.length}`);

    // get values into arrays
    var samplevalues = samplesfilter[0].samplevalues;
    var otuids = samplesfilter[0].otuids;
    var otulabels = samplesfilter[0].otulabels;

    // Create an array of objects to sort so that all of the data is together
    var combinedlist = [];
    for (var i=0; i < samplevalues.length; i++) {
        var otuid = otuids[i];
        var otutext = "OTU " + otuid.toString();
        var combinedobject = {"samplevalues": samplevalues[i], "otuids": otutext, "otulabels": otulabels[i]};
        combinedlist.push(combinedobject);
    }

    // Sort and slice the list of objects
    var sortedlist = combinedlist.sort(compareValues("samplevalues", "desc"));
    var slicedlist = sortedlist.slice(0, 10);

    // Grab the text into arrays with map now
    var samplevalueslist = slicedlist.map(item => item.samplevalues).reverse();
    // console.log(`samplevalueslist: ${samplevalueslist}`);
    var otuidslist = slicedlist.map(item => item.otuids).reverse();
    // console.log(`otuidslist: ${otuidslist}`);
    var otulabelslist = slicedlist.map(item => item.otulabels).reverse();
    // console.log(`otulabelslist: ${otulabelslist}`);

    // Do the Plot
    // trace for the data
    var trace = {
        type: "bar",
        y: otuidslist,
        x: samplevalueslist,
        text: otulabelslist,
        orientation: 'h'
    };

    // data
    var tracedata = [trace];

    // Define the layout
    var layout = {
        title: "Top 10 OTUs Found",
        yaxis: { title: "OTU Labels" },
        xaxis: { title: "Values"}
    };

    Plotly.newPlot("bar", tracedata, layout);
}

// Draw the bubble chart
function drawBubbleChart(idNum) {
    // Log a change
    console.log("Bubble: " + idNum);

    // Just grab the one ID we want
    var samplesfilter = data["samples"].filter(item => item["id"] == idNum);

    // trace for the data
    var trace = {
        x: samplesfilter[0].otuids,
        y: samplesfilter[0].samplevalues,
        mode: 'markers',
        text: samplesfilter[0].otulabels,
        marker: {
                    color: samplesfilter[0].otuids,
                    size: samplesfilter[0].samplevalues,
                    colorscale: "Earth"
        }
    };

    // data
    var tracedata = [trace];

    // Define the layout
    var layout = {
                    showlegend: false,
                    height: 600,
                    width: 1500,
                    xaxis: { title: "OTU ID"}
    };

    Plotly.newPlot('bubble', tracedata, layout);
}

// Draw the gauge chart
function drawGaugeChart(idNum) {
    // Log a change
    console.log("Gauge: " + idNum);

    // Just grab the one ID we want
    var metadatafilter = data.metadata.filter(item => item["id"] == idNum);
    var level = metadatafilter[0].wfreq;
    var offset = [ 0, 0, 3, 3, 1, -0.5, -2, -3, 0, 0];

    // Calc the meter point
    var degrees180 = 180 - (level * 20 + offset[level]);
    var height = .6;
    var widthby2 = .05;
    var radians = degrees180 * Math.PI / 180;
    var radiansBaseL = (90 + degrees180) * Math.PI / 180;
    var radiansBaseR = (degrees180 - 90) * Math.PI / 180;
    var xhead = height * Math.cos(radians);
    var yhead = height * Math.sin(radians);
    var xtail0 = widthby2 * Math.cos(radiansBaseL);
    var ytail0 = widthby2 * Math.sin(radiansBaseL);
    var xtail1 = widthby2 * Math.cos(radiansBaseR);
    var ytail1 = widthby2 * Math.sin(radiansBaseR);

    // Create the triangle for the meter
    var triangle = `M ${xtail0} ${ytail0} L ${xtail1} ${ytail1} L ${xhead} ${yhead} Z`;

    // Create the tracedata variable
    var tracedata = [{
                        type: 'scatter',
                        x: [0],
                        y: [0],
                        marker: {size: 16, color: '#850000'},
                        showlegend: false,
                        name: 'frequency',
                        text: level,
                        hoverinfo: 'text+name'},
                    {   values: [180/9, 180/9, 180/9, 180/9, 180/9, 180/9, 180/9, 180/9, 180/9, 180],
                        rotation: 90,
                        text: ['8-9','7-8','6-7','5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
                        textinfo: 'text',
                        textposition: 'inside',
                        marker: {colors: [  '#84B589', '#89BB8F', '#8CBF88', '#B7CC92', '#D5E49D',
                                            '#E5E7B3', '#E9E6CA', '#F4F1E5', '#F8F3EC', '#FFFFFF',]},
                        labels: ['8-9','7-8','6-7','5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
                        hoverinfo: 'label',
                        hole: .5,
                        type: 'pie',
                        showlegend: false
    }];

    // Define the Layout
    var layout = {
                    shapes:[{ type: 'path', path: triangle, fillcolor: '#850000', line: { color: '#850000' } }],
                    title: '<b>Belly Button Wash Frequency</b><br>Scrubs per Week',
                    xaxis: {zeroline: false, showticklabels: false, showgrid: false, range: [-1, 1]},
                    yaxis: {zeroline: false, showticklabels: false, showgrid: false, range: [-1, 1]}
    };
    Plotly.newPlot('gauge', tracedata, layout);
}

// Initialization: do the load on the data, set up the menu, and draw the initial graphs
function initialization () {
    d3.json("./data/samples.json").then(function(jsonData) {
        console.log("Gathering Data");
        data = jsonData;
        console.log("Keys: " + Object.keys(data));
        names = data.names;

        // Create the Test Subject ID No. Selector
        names.forEach(element => { testsubjectidnumber.append("option").text(element).property("value", element); });

        // Populate the Demo Info Panel
        var idNum = names[0];
        populatedemoinfo(idNum);

        // Draw the Bar Plot
        drawBarPlot(idNum);

        // Draw the Bubble Chart
        drawBubbleChart(idNum);

        // Draw the Gauge Chart
        drawGaugeChart(idNum);
    });
}

initialization();

function optionChanged(idNum) {
    // Update the Demographic Info Panel
    populatedemoinfo(idNum);

    // Draw the Bar Plot
    drawBarPlot(idNum);

    // Draw the Bubble Chart
    drawBubbleChart(idNum);

    // Draw the Gauge Chart
    drawGaugeChart(idNum);
};