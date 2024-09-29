function getRender(scene) {
    const memberVertLst = [];
    const toCheckLst = [scene];
    while (toCheckLst.length != 0) {
        const currItem = toCheckLst.pop();
        if (!currItem.canParent) {
            memberVertLst.push(currItem.physObj.vertices.map(v => {return {x:v.x,y:v.y}}));
            continue;
        }
        toCheckLst.push(...Object.values(currItem.compLst));
    }
    return memberVertLst;
}

exports.getRender = getRender;