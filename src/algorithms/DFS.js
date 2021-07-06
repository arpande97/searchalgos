/*
This is a iterative version of dfs search using an array which
simulates a stack. In Java, you would explicitly use a stack.
Another popular way of implementing a dfs search is the recursive search.
DFS will not give the shortest path, rather, a path.
*/
export function DFS(grid, startNode, finishNode){
    const stack = [] ;
    const openList = [] ;
    stack.push(startNode) ;
    while(stack.length !== 0){
        let node = stack[stack.length - 1] ;
        //gives the last element of the stack array.
        //Or rather, the top of the stack.
        stack.splice(-1, 1) ;
        if(node.isVisited) continue ;
        node.isVisited = true ;
        openList.push(node) ;
        const neighbors = toBeVisited(node, grid) ;
        if(node === finishNode) return openList ;
        openList.push(node) ;
        for(const nodes of neighbors){
            stack.push(nodes) ;
            nodes.previousNode = node ;
        }
    }
}
function toBeVisited(node, grid){
    //gives the 4-direction neighbors except the ones which are visited
    //or are walls.
    const neighbors = [] ;
    const {row, col} = node ;
    if (row > 0) neighbors.push(grid[row - 1][col]);
    if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
    if (col > 0) neighbors.push(grid[row][col - 1]);
    if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
    //filter all the nodes which are already visited or are walls 
    //as defined by the isVisited and isWall property of the node.
    return neighbors.filter(neighbor => !neighbor.isVisited && !neighbor.isWall);
}