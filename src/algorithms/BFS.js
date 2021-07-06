//Level order traversal using a queue. 
//You process a node and then add all the connected nodes to the queue.
export function BFS(grid, startNode, finishNode){
    const q = [] ;
    const openList = [] ;
    q.push(startNode) ;
    while(q.length !== 0){
        //To obtain the first element that entered the queue.
        let node = q.shift() ;
        if(node === finishNode) return openList ;
        node.isVisited = true ;
        openList.push(node) ;
        const neighbors = toBeVisited(node, grid) ;
        for(const nodes of neighbors){
            q.push(nodes) ;
            /*
             the mistake I was making earlier, 
            when I was not able to get the animation for the shortest
            path, was that I was not changing the previousNode property 
            of the node. Look at the function getNodesInShortestPathOrder(),
            in the PathfindingVisualizer.jsx for reference.
             */
            nodes.previousNode = node ;
            
        }
    }
    return openList ;
}
function toBeVisited(node, grid){
  const neighbors = [];
  const {col, row} = node;
  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  //filter all the nodes which are already visited or are walls 
  //as defined by the isVisited and isWall property of the node.
  return neighbors.filter(neighbor => !neighbor.isVisited && !neighbor.isWall);
}
  