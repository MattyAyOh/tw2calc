/**
 * Created by CONG on 25-Nov-15.
 */

var playersList = [];
var tribesList = [];
var provincesList = [];

var _dbReady = 0;
var lastUpdatedTime;
localStorage.dbReady = 0;

Array.prototype.unique = function() {
    for (var e = [], o = 0; o < this.length; o++)
        -1 == e.indexOf(this[o]) && e.push(this[o]);
    return e
}
;

$.getJSON("./db/en15/Combined_PA.json", function(json) {
    console.log('Preparing players snapshot');
    players = Defiant.getSnapshot(json);
    console.log('Completed preparing players\' snapshot');

    var pNames = JSON.search(players, "//players/name");
    for(var i = 0; i < pNames.length; i++){
        playersList.push({id: i, value: pNames[i]});
    }
    lastUpdatedTime = new Date(json.time);

    checkDB_ready();
});

$.getJSON("./db/en15/Tribes.json", function(json) {
    var t = json;

    if(tribesList != null) {
        var tLIdx = 0;
        for(var i = 0; i < t.tribes.length; i += 1) {
            tribesList.push(
                {id: tLIdx++, value: t.tribes[i].name}
            );
        }
    }

    tribes_top10 = t.tribes.slice(0,10);

    var allVillagesInTop10 = 0;
    for(i = 0; i < tribes_top10.length; i++) {
        allVillagesInTop10 += tribes_top10[i].villages;
    }
    for(i = 0; i < tribes_top10.length; i++) {
        tribes_top10[i].dominationRatio = Math.round(tribes_top10[i].villages/allVillagesInTop10*10000)/100;
    }

    console.log('Preparing tribes snapshot');
    tribes = Defiant.getSnapshot(t);
    console.log('Completed preparing tribes\' snapshot');

    checkDB_ready();
});

$.getJSON("./db/en15/Villages.json", function(json) {
    console.log('Preparing villages snapshot');
    villages = Defiant.getSnapshot(json);
    console.log('Completed preparing villages snapshot');

    var ps = JSON.search(villages, "//villages/province_name");
    ps = ps.unique();
    for(var i = 0; i < ps.length; i++){
        provincesList.push({id: i, value: ps[i]});
    }

    checkDB_ready();
});

function checkDB_ready() {
    _dbReady += 1;
}

function db_isReady() {
    return _dbReady >= 3;
}

function db_getSuggestionLists() {
    return {
        provincesList: provincesList,
        playersList: playersList,
        tribesList: tribesList
    }
}
///////////////////////////////////////////////////////////////////////////////////
// SEARCH FUNCTION
///////////////////////////////////////////////////////////////////////////////////

var getCharacterByName1 = "//players[name='";
var getCharacterByName2 = "']";

function search(charName) {
    var player = JSON.search(players, getCharacterByName1 + charName + getCharacterByName2);
    return player[0];
}

function getDBLastUpdatedTime() {
    return lastUpdatedTime.toString();
}

function getVillages(x, y, dx, dy) {
    var boundX = x + dx + 1;
    var boundY = y + dy + 1;

    return JSON.search(players, '//players/villages[village_x >= ' +
        String(x) +
        ' and not(village_x > ' +
        String(boundX) +
        ') and village_y >= ' +
        String(y) +
        ' and not(village_y > ' +
        String(boundY) +
        ')]');
}

function db_getTop10Tribes() {
    return tribes_top10;
}

function getTribeInfo(tribeName) {
    var a = JSON.search(tribes, "//tribes[name=\"" +tribeName+ "\"]" );
    return a[0];
}

function getAllPlayersInTribe(tribeName) {
    return JSON.search(players, "//players[tribeName=\""+tribeName+"\"]");
}

function getTribeNameFromPlayer(playerName) {
    var charProfile = search(playerName);
    return charProfile.tribeName;
}

function getAllPlayersFromTribeWithPlayer(playerName) {
    return getAllPlayersInTribe(getTribeNameFromPlayer(playerName));
}

function getPlayerInfoFromCoor(x, y) {
    var pName = JSON.search(players, '//players/villages[village_x=' +
        String(x) +
        ' and village_y=' +
        String(y) +
        ']');
    pName = pName[0].charName;

    var pData = JSON.search(players, '//players[name=\''+pName+'\']');

    return pData[0];
}

function getVillageInfo(x, y) {
    var village = JSON.search(players, '//players/villages[village_x=' +
        String(x) +
        ' and village_y=' +
        String(y) +
        ']');
    return village[0];
}

function getPlayersFromProvince(province) {
    var v = JSON.search(villages, "//villages[province_name='" + province + "']");
    var pNames = [];
    for(var i = 0; i < v.length; i++) {
        if(v[i].character_name != null) {
            pNames.push(v[i].character_name);
        }
    }

    pNames = pNames.unique();

    var pProfiles = [];
    for (i = 0; i < pNames.length; i++) {
        var jSearch = JSON.search(players, "//players[name='" + pNames[i] + "']");
        pProfiles.push(jSearch[0]);
    }

    return pProfiles;
}

function getPlayersByArea(x, y, w, h) {
    var v = getVillages(x, y, w, h);
    var pNames = [];
    for(var i = 0; i < v.length; i++) {
        pNames.push(v[i].charName);
    }
    pNames = pNames.unique();

    var pProfiles = [];
    for (i = 0; i < pNames.length; i++) {
        var jSearch = JSON.search(players, "//players[name='" + pNames[i] + "']");
        pProfiles.push(jSearch[0]);
    }

    ui_clearTribeInfo();
    ui_displayPlayersInfo(pProfiles);

    return pProfiles;
}