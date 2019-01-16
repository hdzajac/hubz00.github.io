Plotly.d3.csv('Meteorite_Landings.csv', function (err, data) {
    // Create a lookup table to s||t and regroup the columns of data,
    let i;
// first by year, then by continent:
    const lookup = {};
	var allTraces = []
     var mainCategories = {"Ordinary chondrite": '#F0F032',
                        "Enstatite chondrite": '#A0FA82',
                        "Carbonaceous chondrite": '#0AB45A',
						"Chondrites": '#FA7850',
						"Achondrites": '#AA0A3C',
						"Iron": '#14D2DC',
						"Stony-Iron": '#FA78FA' ,
						"Other": '#005AC8' }
//Extra category color: #8214A0

    const categoriesLookup = {};

    function getData(year, category) {
        let byYear, trace;

        if (!(byYear = lookup[year])) {
            byYear = lookup[year] = {};
        }

        // If a container f|| this year + category doesn't exist yet,
        // then create one:
        if (!(trace = byYear[category])) {
            trace = byYear[category] = {
                type: "scattermapbox",
                lat: [],
                lon: [],
                opacity: [],
                customdata: [],
                name: category,
                text: [],
                marker: {
                    size: [],
                    sizemode: 'area',
                    sizeref: 10,
                    sizemin: 5,
                    color: []
                },
                mode: "markers",
                hoverinfo: "none"
            }
        }
        if (!categoriesLookup[category]) {
            categoriesLookup[category] = {};
            allTraces.push({
                type: "scattermapbox",
                lat: [null],
                lon: [null],
                opacity: [],
                customdata: [],
                name: category,
                text: [],
                marker: {
                    size: [],
                    sizemode: 'area',
                    sizeref: 10,
                    sizemin: 5,
                    color: []
                },
                mode: "markers",
            })
        }
        return trace;
    }

    function getDataFinal(year) {
        const categories = Object.keys(lookup[year]);
		const allcategories = Object.keys(mainCategories);
        let traces = [];
		
		for (let j = 0; j <= allcategories.length; j++){
			
			if(!categories.includes(allcategories[j]))
				traces.push({
                type: "scattermapbox",
                lat: [null],
                lon: [null],
                opacity: [],
                customdata: [],
                name: allcategories[j],
                text: [],
                marker: {
                    size: [],
                    sizemode: 'area',
                    sizeref: 10,
                    sizemin: 5,
					line: {color : 'rgb(0,0,0)', width: 2},
                    color: mainCategories[allcategories[j]]
                },
                mode: "markers",
            })
			else
			{
				traces.push(lookup[year][allcategories[j]])
			}
		}
		
        return traces
    }

    function getMaincategory(category) {
        // removeSpecial characters
        category = category.replace(/[^a-zA-Z ]/g, "");
        var c = category.toUpperCase()
        if (c === "L" || c === "LL" || c === "LLL" || c === "H")
            return "Ordinary chondrite"

        if (c === "EH" || c === "EL" || c === "E" || c === "EHAN" || c === "EAN")
            return "Enstatite chondrite"

        if (c === "CI" || c === "CM-CO" || c === "CM" || c === "C" || c === "CBA" ||
            c === "CO" || c === "CV" || c === "CVAN" || c === "CK" || c === "CKAN" || c === "CMAN" ||
            c === "CR" || c === "CH" || c === "CHCBB" || c === "CB"
            || c === "CBAN" || c === "CBB")
            return "Carbonaceous chondrite"

        if (c === "R" || c === "K")
            return "Other chondrite"

        if (c.includes("IRON"))
            return "Iron"

        if (c.includes("LUNAR") || c.includes("MARTIAN") || c.includes("ACHONDRIT") ||
            c.includes("ACAPULCOITE") || c.includes("LODRANITE") || c.includes("WINONAITE") ||
            c.includes("ANGRITE") || c.includes("AUBRITE") || c.includes("EUCRITE") ||
            c.includes("UREILITE") || c.includes("BRACHINITE"))
            return "Achondrites"

        if (c.includes("PALLASITE") || c.includes("MESOSIDERITE"))
            return "Stony-Iron"

        return "Other"

    }


    function getYear(yearStr) {
        let year = yearStr.split(" ")[0];
        year = year.split("/")[2];
        return year
    }

    // Go through each row, get the right trace, and append the data:
    for (i = 0; i < data.length; i++) {
        let datum = data[i];
		if (getYear(datum.year.slice()) > 1800 && getYear(datum.year.slice()) < 2018)
		{
			const trace = getData(getYear(datum.year), getMaincategory(datum.recclass.trim()));
			//trace.name = getMaincategory (datum.recclass.slice().trim());
			trace.marker.color.push(mainCategories[getMaincategory (datum.recclass.slice().trim())]);
			trace.text.push(datum.recclass);
			trace.lat.push(parseFloat(datum.reclat));
			trace.lon.push(parseFloat(datum.reclong));

			let size_bubble = datum.mass * 0.05;
			if (size_bubble > 100000) //limit max bubble size tradeoff
				size_bubble = 100000;

			trace.marker.size.push(size_bubble);
			trace.customdata.push({name: datum.name, year: datum.year, mass: datum.mass});
			trace.marker.opacity = 0.5;
		}
    }

    // Get the group names:
    var years = Object.keys(lookup);
    var categories = Object.keys(categoriesLookup);
    console.log(categoriesLookup, categories.length)


    // Create a frame for each year. Frames are effectively just
    // traces, except they don't need to contain the *full* trace
    // definition (for example, appearance). The frames just need
    // the parts the traces that change (here, the data).
    var frames = [];
    for (i = 0; i < years.length; i++) {
        if (years[i] > 1800 && years[i] < 2018)
            frames.push({
                name: years[i],
                data: getDataFinal(years[i])

            })
    }

    // Now create slider steps, one f|| each frame. The slider
    // executes a plotly.js API command (here, Plotly.animate).
    // In this example, we'll animate to one of the named frames
    // created in the above loop.
    const sliderSteps = [];
    for (i = 0; i < years.length; i++) {
        if (years[i] > 1800 && years[i] < 2018)
            sliderSteps.push({
                method: 'skip',
                label: years[i],
                args: [[years[i]], {
                    mode: 'immediate',
                    transition: {duration: 0},
                    frame: {duration: 0, redraw: false},
                }]
            });
    }

    Plotly.setPlotConfig({
        mapboxAccessToken: 'pk.eyJ1IjoiYW5kcmVlYTA4IiwiYSI6ImNqcXc4dzJicjBzcGQ0OW1xOGxhNG92YzMifQ.oVTjccSQQLufk2dM1HtKjw'
    });

    var layout = {
        autosize: false,
        width: 1300,
        height: 700,
        showlegend: true,
        dragmode: 'zoom',
		legend: 
        {x: 0, y: 5, orientation: 'h'},
        mapbox: {
            center: {
                lat: 11.4,
                lon: 44.70916722
            },
            zoom: 1,
			style: 'light'
        },
        sliders: [{
            pad: {t: 30},
            active: 0,
            xanchor: 'left',
            currentvalue: {
                visible: true,
                prefix: 'Year:',
                xanchor: 'right',
                font: {size: 20, color: '#666'}
            },
            steps: sliderSteps
        }]

    };


    // Create the plot:
    Plotly.plot('plotly-div', {
        data: allTraces,
        layout: layout,
        frames: frames,
    });

    var myPlot = document.getElementById("plotly-div");
    var hoverInfo = document.getElementById('hoverinfo');
	setTimeout(() => {

    Plotly.animate(myPlot, frames.filter(frame => frame.name === '1801')[0], {
		mode: 'immediate',
		transition: {duration: 0},
		frame: {duration: 0, redraw: true},
        })
	}, 100)
    myPlot.on('plotly_hover', function (data) {

        var infotext = data.points.map(function (d) {
            return `<span class='title'>Place: ${d.customdata.name}</span><hr>(${d.lat}, ${d.lon})<br>Type: ${d.data.name}<br>Subtype: ${d.text}<br>Mass: ${d.customdata.mass}g`;
        });


        hoverInfo.innerHTML = infotext;
        var width = hoverInfo.offsetWidth;
        var windowWidth = window.innerWidth;
        var x = data.event.clientX,
            y = data.event.clientY;
        while (x + width > windowWidth - 10) {
            x -= 10;
        }
        hoverInfo.style.top = (y + 10) + 'px';
        hoverInfo.style.left = (x + 10) + 'px';
        hoverInfo.style.visibility = "visible";

    })


        .on('plotly_unhover', function (data) {
            hoverInfo.innerHTML = '';
            hoverInfo.style.visibility = "hidden";
        });



    myPlot.on('plotly_sliderchange', function (data) {
            myPlot.data.forEach(d => {
                if (new Date(d.customdata.year).getFullYear() !== data.step.label) {
                    d.lat = [];
                    d.lon = [];
                    d.marker.size = 0;
                }
            });

            Plotly.animate(myPlot, {
                name: "", data: [{
                    type: "scattermapbox",
                    lat: [],
                    lon: [],
                    opacity: [],
                    customdata: [],
                    name: "clean",
                    text: [],
                    marker: {
                        size: [],
                        sizemode: 'area',
                        sizeref: 10,
                        sizemin: 5,
                        color: [],
                        line: {color : 'rgb(0,0,0)', width: 20}
                    },
                    mode: "markers",
                    hoverinfo: "none"
                }]
            }, {
                mode: 'immediate',
                transition: {duration: 0},
                frame: {duration: 0, redraw: false},
            });

            Plotly.animate(myPlot, frames.filter(frame => frame.name === data.step.label)[0], {
                mode: 'immediate',
                transition: {duration: 0},
                frame: {duration: 0, redraw: false},
            })
    });

});


