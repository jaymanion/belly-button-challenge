// Define a consistent color palette
var colorPalette = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];

// creating bar plot
function drawBarPlot(idNum) {
    console.log("Bar: " + idNum);
    var samples_filter1 = data["samples"].filter(item => item["id"] == idNum);

    // changing data into arrays
    var sample_values = samples_filter1[0].sample_values;
    var otu_ids = samples_filter1[0].otu_ids;
    var otu_labels = samples_filter1[0].otu_labels;

    var all_combined = []
    for (var i = 0; i < sample_values.length; i++) {
        var otu_id = otu_ids[i];
        var otu_text = "OTU " + otu_id.toString();
        var combined_object = {
            "sample_values": sample_values[i],
            "otu_ids": otu_text,
            "otu_labels": otu_labels[i]
        };
        all_combined.push(combined_object);
    }

    // sort and slice
    var sorted_list = all_combined.sort(compareValues("sample_values", "desc"));
    var sliced_list = sorted_list.slice(0, 10);

    // map text to arrays
    var sample_values_list = sliced_list.map(item => item.sample_values).reverse();
    console.log(`sample_values_list: ${sample_values_list}`);
    var otu_ids_list = sliced_list.map(item => item.otu_ids).reverse();
    console.log(`otu_ids_list: ${otu_ids_list}`);
    var otu_labels_list = sliced_list.map(item => item.otu_labels).reverse();
    console.log(`otu_labels_list: ${otu_labels_list}`);

    // create the plot
    var trace1 = {
        type: "bar",
        y: otu_ids_list,
        x: sample_values_list,
        text: otu_labels_list,
        orientation: 'h',
        marker: {
            color: colorPalette // Use the consistent color palette here
        }
    };

    var trace_data1 = [trace1];

    var layout = {
        title: "Top 10 OTU's Found",
        yaxis: {
            title: "OTU Labels"
        },
        xaxis: {
            title: "Values"
        }
    };

    Plotly.newPlot("bar", trace_data1, layout);
}

// creating bubble chart
function drawBubbleChart(idNum) {
    console.log("Bubble: " + idNum);
    var samples_filter2 = data["samples"].filter(item => item["id"] == idNum);

    // trace for the data
    var trace2 = {
        x: samples_filter2[0].otu_ids,
        y: samples_filter2[0].sample_values,
        mode: 'markers',
        text: samples_filter2[0].otu_labels,
        marker: {
            color: samples_filter2[0].otu_ids, // You can change this property according to your data or use a consistent color if appropriate
            size: samples_filter2[0].sample_values,
            colorscale: "Earth"
        }
    };

    // Use the consistent color palette for marker color
    trace2.marker.color = colorPalette.slice(0, samples_filter2[0].otu_ids.length);

    // data
    var trace_data2 = [trace2];

    // Define the layout
    var layout = {
        showlegend: false,
        height: 600,
        width: 1500,
        xaxis: {
            title: "OTU ID"
        }
    };

    Plotly.newPlot('bubble', trace_data2, layout);
}

// creating gauge chart
function drawGaugeChart(idNum) {
    console.log("Gauge: " + idNum);

    var metadata_filter2 = data.metadata.filter(item => item["id"] == idNum);
    var level = metadata_filter2[0].wfreq;
    var offset = [0, 0, 3, 3, 1, -0.5, -2, -3, 0, 0];

    // Calc the meter point
    var degrees = 180 - (level * 20 + offset[level]);
    var height = .6;
    var widthby2 = .05;
    var radians = degrees * Math.PI / 180;
    var radians_base_l = (90 + degrees) * Math.PI / 180;
    var radians_base_r = (degrees - 90) * Math.PI / 180;
    var x_head = height * Math.cos(radians);
    var y_head = height * Math.sin(radians);
    var x_tail1 = widthby2 * Math.cos(radians_base_l);
    var y_tail1 = widthby2 * Math.sin(radians_base_l);
    var x_tail2 = widthby2 * Math.cos(radians_base_r);
    var y_tail2 = widthby2 * Math.sin(radians_base_r);

    // Create the triangle for the meter
    var triangle = `M ${x_tail1} ${y_tail1} L ${x_tail2} ${y_tail2} L ${x_head} ${y_head} Z`;

    // Create the trace_data3 variable
    var trace_data3 = [{
        type: 'scatter',
        x: [0],
        y: [0],
        marker: {
            size: 16,
            color: '#850000'
        },
        showlegend: false,
        name: 'frequency',
		text: level,
        hoverinfo: 'text+name'
    }, {
        values: [180 / 9, 180 / 9, 180 / 9, 180 / 9, 180 / 9, 180 / 9, 180 / 9, 180 / 9, 180 / 9, 180],
        rotation: 90,
        text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
        textinfo: 'text',
        textposition: 'inside',
        marker: {
            colors: colorPalette // Use the consistent color palette here
        },
        labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
        hoverinfo: 'label',
        hole: .5,
        type: 'pie',
        showlegend: false
    }];

    var layout = {
        shapes: [{
            type: 'path',
            path: triangle,
            fillcolor: '#850000',
            line: {
                color: '#850000'
            }
        }],
        title: '<b>Belly Button Wash Frequency</b><br>Scrubs per Week',
        xaxis: {
            zeroline: false,
            showticklabels: false,
            showgrid: false,
            range: [-1, 1]
        },
        yaxis: {
            zeroline: false,
            showticklabels: false,
            showgrid: false,
            range: [-1, 1]
        }
    };
    Plotly.newPlot('gauge', trace_data3, layout);
}
// initializing graphs with Data
function initialization() {
    d3.json("./data/samples.json").then(function(jsonData) {
        console.log("Gathering Data");
        data = jsonData;
        console.log("Keys: " + Object.keys(data));
        names = data.names;
        console.log("Loaded JSON Data:", data);

        // Test Subject ID No. Selector
        names.forEach(element => {
            input.append("option").text(element).property("value", element);
        });

        // Update the Demographic Info Panel
        var idNum = names[0];
        populateDemoInfo(idNum);

        // Draw graphs
        drawBarPlot(idNum);
        drawBubbleChart(idNum);
        drawGaugeChart(idNum);
    });
}

initialization();

function optionChanged(idNum) {
    // Update the Demographic Info Panel
    populateDemoInfo(idNum);

    // Draw graphs
    drawBarPlot(idNum);
    drawBubbleChart(idNum);
    drawGaugeChart(idNum);
};
