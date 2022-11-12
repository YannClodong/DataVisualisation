var datas = []

var selectedColor = "#ad5959"
var overedBackground = "#f2f2f2"

var selectedLocation = [];
var selectedGenre = [];
var showUnknownGenre = false;

function putOnTop(parent, selector) {
    var removed = parent.select(selector).remove()
    parent.append(() => removed.node())
}
function initHeatmap() {
    console.log("Init heatmap")


    const container = function () {
        return d3.select("#viz").node()
    }
    const height = function () {
        return container().offsetHeight - 10
    }
    const width = function () {
        return container().offsetWidth
    }

    const panelWidth = 300;

    const chartArea = function () {
        const c = container();

        return {
            top: 10,
            left: 100,
            width: c.offsetWidth - 110 - ((selectedLocation?.length ?? 0) === 3 ? panelWidth : 0),
            height: c.offsetHeight - 50
        }
    }


    console.log("Start painting")

    d3.select("#viz").select("svg").remove();
    d3.select("#viz").selectAll("div").remove();

    const tooltip = d3.select("#viz").append("div")
        .style("display", "none")
        .style("padding", "5px")
        .style("background", "gray")
        .style("position", "absolute")
        .style("z-index", "10")
    
    const tooltipText = tooltip.append("p");

    const svg = d3.select("#viz")
        .append("svg")
        .attr("width", function () {
            return width()
        })
        .attr("height", function () {
            return height()
        })

    const drawingData = getDrawingData(datas, selectedLocation, selectedGenre)


    var chartWidth = chartArea().width
    var chartHeight = chartArea().height
    var myColor = d3.scaleSequential(d3.interpolateBlues)
        .domain([0, Math.log10(drawingData.map(d => d.count).reduce((pv, cv) => cv > pv ? cv : pv, 0))])


    // Build X scales and axis:

    var pathsLocation = {}
    var pathsGenre = {}
    for (var v of drawingData) {
        pathsLocation[v.locationLabel] = v.locationPath
        pathsGenre[v.genreLabel] = v.genrePath
    }

    x = d3.scaleBand()
        .range([0, chartWidth])
        .domain(drawingData.map(d => d.locationLabel))
        .padding(0.05);

    const xTitles = svg.append("g")
        .style("font-size", 15)
        .attr("transform", "translate(" + chartArea().left + "," + (chartArea().top + chartArea().height) + ")")
        .call(d3.axisBottom(x).tickSize(0))

    xTitles.selectAll(".tick> text")
        .style("user-select", "none")
        .style("cursor", "pointer")
        .on("mouseover", function (d) {
            const path = pathsLocation[d3.select(this).text()]
            const selected = selectedLocation.length > 0 && path.startWith(selectedLocation)

            if (!selected) {
                d3.select(this.parentNode).select("rect").style("fill", overedBackground)
            }
        })
        .on("mouseleave", function (d) {
            const path = pathsLocation[d3.select(this).text()]
            const selected = selectedLocation.length > 0 && path.startWith(selectedLocation)

            if (!selected) {
                d3.select(this.parentNode).select("rect").style("fill", "transparent")
            }
        })
        .on("mousedown", function (d) {
            const path = pathsLocation[d3.select(this).text()]
            if (selectedLocation.length === 3 && path.length === 3) return;
            if (path[0] === "Inconnu")
                selectedLocation = ["Inconnu", "Inconnu", "Inconnu"]
            else
                selectedLocation = path
            initHeatmap()
        });

    xTitles.selectAll(".tick")
        .insert("rect", "line + *")
        .attr("width", () => x.bandwidth())
        .attr("transform", `translate(-${x.bandwidth() / 2}, 0)`)
        .attr("y", () => -chartArea().height - chartArea().top)
        .attr("height", () => height())
        .attr("fill", d => selectedLocation.length > 0 && pathsLocation[d].startWith(selectedLocation) ? selectedColor : "transparent")

    putOnTop(xTitles, ".domain");

    // Build Y scales and axis:
    var y = d3.scaleBand()
        .range([chartHeight, 0])
        .domain(drawingData.sort((g1, g2) => comparePath(g1.genre, g2.genre)).map((d) => d.genreLabel))
        .padding(0.05);
    const yTitles = svg.append("g")
        .style("font-size", 15)
        .attr("transform", `translate(${chartArea().left}, ${chartArea().top})`)
        .call(d3.axisLeft(y).tickSize(0))

    yTitles.selectAll(".tick")
        .style("opacity", d => {
            var path = pathsGenre[d]
            if (path.length > 1 && path.includes("Other")) return 0
            return 1
        })

    yTitles.selectAll(".tick")
        .insert("rect", "line + *")
        .attr("width", () => width())
        .attr("height", () => y.bandwidth())
        .attr("transform", `translate(0, -${y.bandwidth() / 2})`)
        .attr("x", () => -chartArea().left)
        .style("fill", d => selectedGenre.length > 0 && pathsGenre[d].startWith(selectedGenre) ? selectedColor : "transparent")

    putOnTop(yTitles, ".domain");
    yTitles.selectAll(".tick> text")
        .style("user-select", "none")
        .style("cursor", "pointer")
        .on("mouseover", function (d) {
            const path = pathsGenre[d3.select(this).text()]
            const selected = selectedGenre.length > 0 && path.startWith(selectedGenre)

            // Show if other element
            if (path.length > 1 && path.includes("Other")) {
                d3
                    .select(this.parentNode)
                    .style("opacity", 1)
                    .select("rect")
                    .style("fill", selectedColor);
                return;
            }

            if (selected) {
                d3.select(this.parentNode).select("rect").style("fill", selectedColor)
            } else {
                d3.select(this.parentNode).select("rect").style("fill", overedBackground)
            }
        })
        .on("mouseleave", function (d) {
            const path = pathsGenre[d3.select(this).text()]
            const selected = selectedGenre.length > 0 && path.startWith(selectedGenre)

            // Show if other element
            if (path.length > 1 && path.includes("Other")) {
                d3
                    .select(this.parentNode)
                    .style("opacity", 0)
                return;
            }

            if (selected) {
                d3.select(this.parentNode).select("rect").style("fill", selectedColor)
            } else {
                d3.select(this.parentNode).select("rect").style("fill", "transparent")
            }
        })
        .on("mousedown", function (d) {
            const path = pathsGenre[d3.select(this).text()]
            if (path.length === 2) return;
            selectedGenre = path
            initHeatmap()
        })

    svg.selectAll()
        .data(drawingData, function (d) {
            return `${d.locationLabel}:${d.genreLabel}`
        })
        .enter()
        .append("rect")
        .attr("x", d => chartArea().left + x(d.locationLabel))
        .attr("y", d => chartArea().top + y(d.genreLabel))
        .attr("fill", d => myColor(Math.log10(d.count)))
        .attr("width", () => x.bandwidth())
        .attr("height", () => y.bandwidth())
        .on("mousemove", function(d) {
            d3.select(this).style("opacity", 0.8)
            tooltip.style("display", "inline-block")
                .style("left", (d.clientX + 10) + "px")
                .style("top", (d.clientY - 10) + "px")
            tooltipText.text(`${d3.select(this).data()[0].count} albums`);
        })
        .on("mouseleave", function(d) {
            d3.select(this).style("opacity", 1)
            tooltip.style("display", "none")
        })


    if (selectedLocation.length === 3) {
        const panel = d3.select("#viz")
            .append("div")
            .style("width", (panelWidth - 20) + "px")
            .style("height", "calc(100% - 20px)")
            .style("position", "absolute")
            .style("right", "0")
            .style("top", "0")
            .style("overflow-y", "auto")
            .style("overflow-x", "hidden")
            .style("display", "flex")
            .style("flex-direction", "column")
            .style("padding", "10px")
            .style("background-color", "white")

        panel.append("h1")
            .text(selectedLocation[selectedLocation.length - 1])

        
        const pieDataWithoutColor = getDrawingData(datas, selectedLocation, selectedGenre, showUnknownGenre).filter(d => d.locationPath.equals(selectedLocation))
        const pieColor = d3.scaleOrdinal()
            .domain([0, pieDataWithoutColor.length])
            .range(d3.schemePaired)
             //datas.filter(d => d.location.equals(selectedLocation))
        const pieData = pieDataWithoutColor.map((d, i) => Object.assign({}, d, {
            color: pieColor(i)
        }))
        const total = pieData.reduce((acc, d) => acc + d.count, 0)
        const pieSize = panelWidth - 20

        const chartHolder = panel.append("div")
            .attr("class", "pieHolder")
            .style("width", panelWidth + "px")
            .style("height", panelWidth + "px")
            .style("margin-bottom", "10px")
            .append("div")
            .style("height", panelWidth + "px")
            .style("width", panelWidth + "px")
            .attr("id", "pie")
            .append("svg")
            .attr("width", panelWidth)
            .attr("height", panelWidth)

        /* const legend = panel.append("div")
            .style("width", "100%")
            .style("display", "flex")
            .style("flex-wrap", "wrap")
            .attr("class", "legend")
            .selectAll().data(pieData).enter()
            .append("div")
            .style("display", "flex")
            .style("align-items", "center")
            .style("overflow", "hidden")
            .style("width", "50%")
            .attr("class", "legend-element")
        d3.selectAll(".legend-element")
            .append("div")
            .style("height", "30px")
            .style("width", "30px")
            .style("background-color", d => d.color)
        d3.selectAll(".legend-element")
            .append("p")
            .style("margin", 0)
            .text(d => d.genreLabel) */ 
        const options = panel.append("div")
            .style("flex", "1")
        options.append("input")
            .attr("type", "checkbox")
            .attr("id", "showUnknownGenre")
            .attr("checked", showUnknownGenre ? "checked" : undefined)
            .on("click", function(d) {
                showUnknownGenre = d.currentTarget.checked
                initHeatmap()
            })

        options.append("label")
            .attr("for", "showUnknownGenre")
            .text("Show unknown genres")


        let g = chartHolder.append("g")
            .attr("transform", `translate(${(panelWidth - 20) / 2},${(panelWidth - 20) / 2})`);

        // Creating Pie generator
        var pie = d3.pie()
            .value(d => d.count);

        // Creating arc
        var arc = d3.arc()
            .innerRadius(0)
            .outerRadius(panelWidth / 2 - 20);

        // Grouping different arcs
        var arcs = g.selectAll("arc")
            .data(pie(pieData))
            .enter()
            .append("g")
            .on("mousemove", function (d) {
                const genre = d3.select(this).data()[0].data;
                d3.select(this).style("opacity", 0.5)
                tooltip.style("display", "inline-block")
                    .style("left", (d.clientX + 10) + "px")
                    .style("top", (d.clientY + 10) + "px");
                tooltipText
                    .text(genre.genreLabel + ": " + (genre.count / total * 100).toFixed(2) + "%");
            })
            .on("mouseleave", function (d) {
                d3.select(this).style("opacity", 1)
                tooltip.style("display", "none");
            });


        // Appending path 
        arcs.append("path")
            .attr("fill", (data, i) => {
                return data.data.color;
            })
            .attr("d", arc);
    }

}

loadData().then(result => {
    datas = result;
    initHeatmap();
})