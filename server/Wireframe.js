function getRender(scene) {
    const memberDataLst = [];
    const toCheckLst = [scene];
    while (toCheckLst.length != 0) {
        const currItem = toCheckLst.pop();
        if (!currItem.canParent) {
            currItem.renderOps.name = currItem.name;
            switch (currItem.renderOps.type) {
                case 'button':
                    memberDataLst.push({type:'button',data:{renderOps:currItem.renderOps}}); break;
                case 'textbox':
                    memberDataLst.push({type:'textbox',data:{renderOps:currItem.renderOps}}); break;
                case 'polygon':
                    memberDataLst.push({type:'polygon', data:{renderOps:currItem.renderOps,vertices:currItem.physObj.vertices.map(v => {return {x:v.x,y:v.y}})}}); break;
                case 'circle':
                    memberDataLst.push({type:'circle', data:{renderOps:currItem.renderOps,center:{x:currItem.physObj.position.x,y:currItem.physObj.position.y},radius:currItem.physObj.circleRadius}}); break;
            }
        continue;
        }
        toCheckLst.push(...Object.values(currItem.compLst));
    }
    return memberDataLst;
}

exports.getRender = getRender;