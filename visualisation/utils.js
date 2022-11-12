Array.prototype.groupBy = function (keyExtractor) {
    return groupBy(this, keyExtractor)
}
Array.prototype.distinct = function (keyExtractor) {
    var set = new Set();
    if (!keyExtractor) keyExtractor = i => i;
    return this.filter((v) => {
        if (set.has(keyExtractor(v))) return false;
        set.add(keyExtractor(v))
        return true;
    })
}
Array.prototype.equals = function (a) {
    return a.length === this.length && this.every((d, i) => d === a[i])
}

Object.prototype.getValues = function () {
    return Object.values(this);
}
Array.prototype.sortLinks = function () {
    return this.sort((a, b) => {
        for (var i = 0; i < Math.min(a.length, b.length); i++) {
            var comparison = a[i].localeCompare(b[i])
            if (comparison !== 0) return comparison;
        }
        return Math.sign(a.length - b.length);
    })
}

Array.prototype.startWith = function(arr) {
    return this.slice(0, arr.length).equals(arr)
}


var groupBy = function (xs, keyExtractor) {
    if (typeof keyExtractor == "string") {
        var key = keyExtractor
        keyExtractor = x => x[key]
    }
    if (typeof keyExtractor == "object") {
        var keys = Object.values(keyExtractor)
        keyExtractor = x => keys.map(k => {
            return x[k]
        }).join(":")
    }

    return xs.reduce(function (rv, x) {
        (rv[keyExtractor(x)] = rv[keyExtractor(x)] || []).push(x);
        return rv;
    }, {});
};

function comparePath(path1, path2) {
    for (var i = 0; i < Math.min(path1.length, path2.length); i++) {
        var comp = path1[i].localeCompare(path2[i])
        if (comp !== 0) return comp;
    }
    return Math.sign(path1.length - path2.length);
}

function assert(val, testName) {
    if(!val) {
        if(testName) {
            console.error('Test failed: ' + testName);
        } else {
            console.error('Test failed');
        }
    }
    else if(testName) {
        console.log('Test passed: ' + testName);
    }
}

function run(predicate) {
    predicate();
}