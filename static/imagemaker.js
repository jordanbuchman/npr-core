import fabric;

// canvas on which the graphic result will be displayed
function createResult(percentage, verdict, ) {
    var resultCanvas = new fabric.StaticCanvas('c');

    // Percentage text
    resultCanvas.add(new fabric.Text("You are " + percentage.toString() + "% NPRcore", {
        fontFamily: 'Impact',
        fontSize: 40,
        fontWeight: bold,
        textAlign: 'center'
    }));

    // Verdict text
    resultCanvas.add(new fabric.Text("Verdict: " + verdict, {
        fontFamily: 'Impact',
        fontSize: 20,
        textAlign: 'center'
    }));

    // Album group
    resultCanvas.add(captionGroup("Top 3 Artists", albumStructList));

    // Song group
    resultCanvas.add(captionGroup("Top 3 Artists", songStructList));

    return resultCanvas;
}

// Creates a titled graphic of three song/album captions
function captionGroup(groupTitle, artStructList) {

    var group = new fabric.Group([new fabric.Text("Verdict: " + verdict, {
        fontFamily: 'Impact',
        fontSize: 20,
        textAlign: 'center'
    }));

    // Add each album/song art caption
    for (i = 0; i < artStructList.length; i++) {
        var struct = artStructList[i];
        group.add(artCaption(struct.image,
                             struct.name,
                             struct.artistname,
                             struct.nprRanking
        ));
    }

    return group;
}

// Takes album/song art and other song info,
// returns a fabric group image of the art with the song info as a caption
function artCaption(artImage, name, artistName, nprRanking) {
    
    // Formats text
    function formatText(text) {
        return new fabric.Text(text, {
            fontFamily: 'Impact',
            fontSize: 12,
            textAlign: 'center'
        });
    }
    
    return new fabric.Group([
        new fabric.Image(artImage, { left: 100, top: 100 }),
        formatText(name),
        formatText(artistName),
        formatText("NPR ranking: {} " nprRanking)
    ], {
        left: 100,
        top: 100,
    });
}