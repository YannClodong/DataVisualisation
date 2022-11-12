loadData().then(datas => {
    const totalNumber = datas.map(d => d.count).reduce((pv, cv) => pv + cv, 0)

    run(() => {
        const matches = getMatches(datas, ["Europe"], [])
        assert(matches.filter(d => d.locationMatch).every(d => d.location[0] === "Europe" && d.lastLevelLocationMatch === d.location[1] && d.locationPath.length === 2), "Check location match for depth 1")
        assert(matches.filter(d => !d.locationMatch && d.location[0] === "Europe").length  === 0, "Check location match for depth 1 (contra.)")
    })

    run(() => {
        const matches = getMatches(datas, [], ["Rock"])
        assert(matches.filter(d => d.genreMatch).every(d => d.genre[0] === "Rock" && d.lastLevelGenreMatch === d.genre[1] && d.genrePath.length === 2), "Check genre match for depth 1")
        assert(matches.filter(d => !d.genreMatch && d.genre[0] === "Rock").length  === 0, "Check genre match for depth 1 (contra.)")
    })

    run(() => {
        const matches = getMatches(datas, [], [])
        assert(matches.filter(d => d.locationMatch || d.genreMatch).length === 0, "Check location match for depth 0")
    })

    assert(getSelectedData(getMatches(datas, ["Europe"], [])).every(d => d.location[0] === "Europe"), "Single depth location selection")
    assert(getSelectedData(getMatches(datas, ["Europe", "Western Europe"], [])).every(d => d.location[0] == "Europe" && d.location[1] == "Western Europe"), "Two depth location selection")
    assert(getSelectedData(getMatches(datas, ["Europe", "Western Europe", "France"], [])).every(d => d.location[0] == "Europe" && d.location[1] == "Western Europe" && d.location[2] == "France"), "Three depth location selection")

    assert(getSelectedData(getMatches(datas, [], ["Rock"])).every(d => d.genre[0] === "Rock"), "Single depth genre selection") 

    run(() => {
        // Test that the number of data has not changed
        const matches = getMatches(datas, ["Europe"], ["Rock"])
        assert(getSelectedData(matches).map(d => d.count).reduce((pv, cv) => pv + cv, 0) + getNotSelectedData(matches).map(d => d.count).reduce((pv, cv) => pv + cv, 0) === totalNumber, "Check that the number of data has not changed")
    })
    run(() => {
        const drawingData = getDrawingData(datas, ["Europe"], ["Rock"])

        assert(drawingData.reduce((pv, cv) => pv + cv.count, 0) === totalNumber, "Check that the number of data has not changed after grouping");
        assert(drawingData.filter(d => d.locationPath[0] !== "Europe").every(d => d.locationPath.length === 1), "Check that all location paths are of depth 1 if not selected");
        assert(drawingData.filter(d => d.genrePath[0] !== "Rock").every(d => d.genrePath.length === 1), "Check that all genre paths are of depth 1 if not selected");
        assert(drawingData.filter(d => d.locationPath[0] === "Europe").every(d => d.locationPath.length === 2), "Check that all location paths are of depth 2 if selected");
        assert(drawingData.filter(d => d.genrePath[0] === "Rock").every(d => d.genrePath.length === 2), "Check that all genre paths are of depth 2 if selected");
    })

    run(() => {
        drawingData1 = getDrawingData(datas, ["Europe"], ["Rock"])
        drawingData2 = getDrawingData(datas, [], [])
        assert(drawingData1.filter(d => d.locationPath.includes("Europe")).map(d => d.count).reduce((pv, cv) => pv + cv, 0) === drawingData2.filter(d => d.locationPath.includes("Europe")).map(d => d.count).reduce((pv, cv) => pv + cv, 0), "Check that the number of data has not changed");
    })
})