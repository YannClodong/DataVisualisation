async function loadData() {
    var realData = await d3.csv("data.csv")
    realData = realData.map(e => {
        return {
            country: e["country_name"],
            region: e["region"],
            continent: e["continent"],
            genre: e["genre"],
            count: parseInt(e["count"]),
            date: e["date"]
        }
    })
    realData = realData.groupBy(d => d.country + ":" + d.genre).getValues()
    realData = realData.map(d => Object.assign(d[0], {
        count: d.map(d => d.count).reduce((pv, cv) => pv + cv, 0)
    }))

    realData = realData.map(d => {
        return {
            location: [d["continent"], d["region"], shortenCountry(d["country"])],
            genre: getGenrePath(d["genre"]),
            count: d["count"]
        }
    })
    return realData;
}

var shortenCountry = function (name) {
    if (name === "Royaume-Uni de Grande-Bretagne et d'Irlande du Nord") return "UK";
    if (name === "F�d�ration de Russie") return "Russie"
    if (name === "R�publique tch�que") return "R. tchèque"
    if (name === "�tats-Unis d'Am�rique") return "USA"
    if (name === "Norv�ge") return "Norvège"
    if (name === "Su�de") return "Suède"
    return name;
}

function getGenrePath(genre) {
    if (genre.match(/.*[rR]ock.*/)) return ["Rock", genre]
    if (genre.match(/.*[mM]etal.*/)) return ["Metal", genre]
    if (genre.match(/.*[cC]ountry.*/)) return ["Country", genre]
    if (genre.match(/.*Hip Hop.*/)) return ["Hip Hop", genre]
    if (genre.match(/.*[pP]op.*/)) return ["Pop", genre]
    if (genre.match(/.*Wave.*/)) return ["Wave", genre]
    if (genre.match(/.*Electro.*/)) return ["Electro", genre]
    if (genre.match(/.*[pP]unk.*/)) return ["Punk", genre]
    if (genre.match(/[fF][oi]lk.*/)) return ["Folk", genre]
    if (genre.match(/.*[jJ]azz.*/)) return ["Jazz", genre]
    if (genre.match(/.*R&amp;B.*/)) return ["R&B", genre]
    if (genre.match(/.*Visual Kei.*/)) return ["Visual Kei", genre]
    if (["Protest Song", "Christmas", "Christian", "Religious"].includes(genre)) return ["Religious", genre]
    return ["Other", genre];
}

function getMatches(raw, selectedLocation, selectedGenre) {
    return raw.map(d => Object.assign({}, d, {
        locationMatch: d.location.startWith(selectedLocation) && selectedLocation.length,
        genreMatch: d.genre.startWith(selectedGenre) && selectedGenre.length,
    })).map(d => Object.assign({}, d, d.locationMatch ? {
        lastLevelLocationMatch: d.location[Math.min(d.location.length - 1, selectedLocation.length)],
        locationPath: d.location.slice(0, Math.min(d.location.length, selectedLocation.length + 1)),
    } : {
        lastLevelLocationMatch: d.location[0],
        locationPath: d.location.slice(0, 1),
    })).map(d => Object.assign({}, d, d.genreMatch ? {
        lastLevelGenreMatch: d.genre[Math.min(d.genre.length - 1, selectedGenre.length)],
        genrePath: d.genre.slice(0, Math.min(d.genre.length, selectedGenre.length + 1)),
    } : {
        lastLevelGenreMatch: d.genre[0],
        genrePath: d.genre.slice(0, 1),
    }));
}

function getSelectedData(raw) {
    return raw.filter(d => d.locationMatch || d.genreMatch);
}

function getNotSelectedData(raw) {
    return raw.filter(d => !d.locationMatch && !d.genreMatch);
}

function getDrawingData(raw, selectedLocation, selectedGenre, showUnknownGenre) {
    if(showUnknownGenre === undefined) showUnknownGenre = true;
    if(!showUnknownGenre)
        raw = raw.filter(d => !d.genre.includes("Inconnu"));
    const matches = getMatches(raw, selectedLocation, selectedGenre);
    const selected = getSelectedData(matches).groupBy(d => d.lastLevelLocationMatch + ":" + d.lastLevelGenreMatch).getValues()
        .map(d => Object.assign({}, d[0], { count: d.map(d => d.count).reduce((pv, cv) => pv + cv, 0) }))
        .map(d => Object.assign({}, d, { 
            locationLabel: d.lastLevelLocationMatch, 
            genreLabel: d.lastLevelGenreMatch
        }));
    const notSelected = getNotSelectedData(matches).groupBy(d => d.location[0] + ":" + d.genre[0]).getValues()
        .map(d => Object.assign({}, d[0], { count: d.map(d => d.count).reduce((pv, cv) => pv + cv, 0) }))
        .map(d => Object.assign({}, d, { locationLabel: d.location[0], genreLabel: d.genre[0] }));
    return selected.concat(notSelected).sort((a, b) => comparePath([...a.locationPath, ...a.genrePath], [...b.locationPath, ...b.genrePath]));
}