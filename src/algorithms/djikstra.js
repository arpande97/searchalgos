/*
This is the lazy implementation of djikstra. You could achieve far better 
time complexity with using a Adjacency List representation of the graph
(doesn't really apply in this case) and a min heap instead of sorting.
*/
/*
Djikstra's algorithm is a single source shortest path algorithm.
*/
export function djikstra(grid, startNode, finishNode) {
    const openList = [];
    startNode.distance = 0;
    //same as having access to distance array, with all the distance[node]
    //set to infinity, except that of startNode i.e. distance[startNode] = 0.
    const closedList = getDistanceArray(grid);
  
    while (closedList.length) {
      closedList.sort((nodeA, nodeB) => nodeA.distance - nodeB.distance);
      const node = closedList.shift();
        /*the next statement is necessary because if unvisitedNeighbors is not able
        to pick any node because of the wall, it will pick one with the 
        infinite distance and start from there.
        */
        if (node.distance === Infinity) return openList;
        node.isVisited = true;
        openList.push(node);
        if (node === finishNode) return openList;
        relaxTheNodes(node, grid);
    }
  }
  
  function getDistanceArray(grid) {
    const nodes = [];
    for (const row of grid) {
      for (const node of row) {
        nodes.push(node);
      }
    }
    return nodes;
  }
  
  function relaxTheNodes(node, grid) {
    //gives the 4-direction neighbors except the ones which are visited
    //or are walls.
    const unvisitedNeighbors = toBeVisited(node, grid);
    for (const neighbor of unvisitedNeighbors) {
      neighbor.distance = node.distance + 1;
      neighbor.previousNode = node;
    }
  }
  
  function toBeVisited(node, grid) {
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
   