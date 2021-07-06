import React, {Component} from 'react';
import Node from './Node/Node';
import {djikstra} from '../algorithms/djikstra';
import {AStar} from '../algorithms/AStar';
import {DFS} from '../algorithms/DFS';
import {BFS} from '../algorithms/BFS';

import './PathfindingVisualizer.css';
/*
There is a minor error with the app. When you set up walls around the start point such 
that there is no path to the target, it gives the correct result, showing no path to it.
Now if you breakdown the wall at one point such that the target is reachable now, 
it shows the path. The error occurs when you once again set up the wall around it.
For some reason it remembers the path it took in the previous step, and shows the path, 
even though there isn't one.
The only way around this problem is to refresh the page and start over again.
*/
export default class PathfindingVisualizer extends Component {
  constructor() {
    super() ;
    this.state = {
      grid: [],
      startRow: 5,
      finishRow: 5,
      startCol: 5,
      finishCol: 15,
      mouseIsPressed: false,
      isRunning: false,
      isStartNode: false,
      isFinishNode: false,
      isWallNode: false,
      currRow: 0,
      currCol: 0,
      desktop: true,
    };

    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.toggleIsRunning = this.toggleIsRunning.bind(this);
  }

  componentDidMount() {
    const grid = this.setUpTheGrid();
    this.setState({grid});
  }

  toggleIsRunning() {
    this.setState({isRunning: !this.state.isRunning});
  }
///changeView() is used to switch from desktop to mobile view and vice versa.
//is called when you click on Using a Mobile button.
  changeView() {
    if (!this.state.isRunning) {
      this.clearGrid();
      this.clearWalls();
      const desktop = !this.state.desktop;
      let grid;
      if (desktop) {
        grid = this.setUpTheGrid(20, 35) ;
        this.setState({desktop, grid});
      } else {
        //The initial start and finish nodes change to [0, 0] and [0, 5]
        //when switching to mobile view if 
        //they exist outside the 10*20 grid(i.e. the mobile view grid).
        if (this.state.startRow > 10 || this.state.finishRow > 20 || this.state.startCol > 10 || this.state.finishCol > 20)
        {
          this.state.startCol = 0 ;
          this.state.startRow = 0 ;
          this.state.finishCol = 5 ;
          this.state.finishRow = 0 ;
        }
          grid = this.setUpTheGrid(10, 20) ;
          this.setState({desktop, grid});
      }
    }
  }
//we will be using 20*35 grid for desktop view and
//10*20 grid for the mobile view
  setUpTheGrid = (rowCount = 20, colCount = 35) => {
    const initialGrid = [];
    for (let row = 0; row < rowCount; row++) {
      const currentRow = [];
      for (let col = 0; col < colCount; col++) {
        currentRow.push(this.setUpTheNodes(row, col));
      }
      initialGrid.push(currentRow);
    }
    return initialGrid;
  };
//Creates the individual node objects with various properties.
  setUpTheNodes = (row, col) => {
    return {
      row,
      col,
      isStart: row === this.state.startRow && col === this.state.startCol,
      isFinish: row === this.state.finishRow && col === this.state.finishCol,
        //The initial distance is set to infinity for every node.
      distance: Infinity,
      /*
      The heuristic property used here will be used for the A* search.
      This heuristic property is an approximate heuristic and is the 
      Manhattan Distance between the node and target.
      */
      heuristic: Math.abs(this.state.finishRow - row) + Math.abs(this.state.finishCol - col),
      isVisited: false,
      isWall: false,
      previousNode: null,
      isNode: true,
    };
  };

  handleMouseDown(row, col) {
    if (!this.state.isRunning) {
      if (this.isGridClear()) {
        if (
          document.getElementById(`node-${row}-${col}`).className ===
          'node node-start'
        ) {
          this.setState({
            mouseIsPressed: true,
            isStartNode: true,
            currRow: row,
            currCol: col,
          });
        } else if (
          document.getElementById(`node-${row}-${col}`).className ===
          'node node-finish'
        ) {
          this.setState({
            mouseIsPressed: true,
            isFinishNode: true,
            currRow: row,
            currCol: col,
          });
        } else {
          const newGrid = toggleWalls(this.state.grid, row, col);
          this.setState({
            grid: newGrid,
            mouseIsPressed: true,
            isWallNode: true,
            currRow: row,
            currCol: col,
            //change if needed
          });
        }
      } else {
        this.clearGrid();
      }
    }
  }
 // isGridClear() method used by handleMouseDown()
  isGridClear() {
    for (const row of this.state.grid) {
      for (const node of row) {
        const nodeClassName = document.getElementById(
          `node-${node.row}-${node.col}`,
        ).className;
        if (
          nodeClassName === 'node node-visited' ||
          nodeClassName === 'node node-shortest-path'
        ) {
          return false;
        }
      }
    }
    return true;
  }

  handleMouseEnter(row, col) {
    if (!this.state.isRunning) {
      if (this.state.mouseIsPressed) {
        const nodeClassName = document.getElementById(`node-${row}-${col}`)
          .className;
        if (this.state.isStartNode) {
          if (nodeClassName !== 'node node-wall') {
            const prevStartNode = this.state.grid[this.state.currRow][
              this.state.currCol
            ];
            prevStartNode.isStart = false;
            document.getElementById(
              `node-${this.state.currRow}-${this.state.currCol}`,
            ).className = 'node';

            this.setState({currRow: row, currCol: col});
            const currStartNode = this.state.grid[row][col];
            currStartNode.isStart = true;
            document.getElementById(`node-${row}-${col}`).className =
              'node node-start';
          }
          this.setState({startRow: row, startCol: col});
        } else if (this.state.isFinishNode) {
          if (nodeClassName !== 'node node-wall') {
            const prevFinishNode = this.state.grid[this.state.currRow][
              this.state.currCol
            ];
            prevFinishNode.isFinish = false;
            document.getElementById(
              `node-${this.state.currRow}-${this.state.currCol}`,
            ).className = 'node';

            this.setState({currRow: row, currCol: col});
            const currFinishNode = this.state.grid[row][col];
            currFinishNode.isFinish = true;
            document.getElementById(`node-${row}-${col}`).className =
              'node node-finish';
          }
          this.setState({finishRow: row, finishCol: col});
        } else if (this.state.isWallNode) {
          const newGrid = toggleWalls(this.state.grid, row, col);
          this.setState({grid: newGrid});
        }
      }
    }
  }

  handleMouseUp(row, col) {
    if (!this.state.isRunning) {
      this.setState({mouseIsPressed: false});
      if (this.state.isStartNode) {
        const isStartNode = !this.state.isStartNode;
        this.setState({isStartNode, startRow: row, startCoL: col});
      } else if (this.state.isFinishNode) {
        const isFinishNode = !this.state.isFinishNode;
        this.setState({
          isFinishNode,
          finishRow: row,
          finishCol: col,
        });
      }
      this.setUpTheGrid();
    }
  }

  handleMouseLeave() {
    if (this.state.isStartNode) {
      const isStartNode = !this.state.isStartNode;
      this.setState({isStartNode, mouseIsPressed: false});
    } else if (this.state.isFinishNode) {
      const isFinishNode = !this.state.isFinishNode;
      this.setState({isFinishNode, mouseIsPressed: false});
    } else if (this.state.isWallNode) {
      const isWallNode = !this.state.isWallNode;
      this.setState({isWallNode, mouseIsPressed: false});
      this.setUpTheGrid();
    }
  }


  clearGrid() {
    if (!this.state.isRunning) {
      const newGrid = this.state.grid.slice();
      for (const row of newGrid) {
        for (const node of row) {
          let nodeClassName = document.getElementById(
            `node-${node.row}-${node.col}`,
          ).className;
          if (
            nodeClassName !== 'node node-start' &&
            nodeClassName !== 'node node-finish' &&
            nodeClassName !== 'node node-wall'
          ) {
            document.getElementById(`node-${node.row}-${node.col}`).className =
              'node';
            node.isVisited = false;
            node.distance = Infinity;
            node.heuristic = Math.abs(this.state.finishRow - node.row) + Math.abs(this.state.finishCol - node.col);
          }
          if (nodeClassName === 'node node-finish') {
            node.isVisited = false;
            node.distance = Infinity;
            node.heuristic = 0;
          }
          if (nodeClassName === 'node node-start') {
            node.isVisited = false;
            node.distance = Infinity;
            node.heuristic = Math.abs(this.state.finishRow - node.row) + Math.abs(this.state.finishCol - node.col);
            node.isStart = true;
            node.isWall = false;
            node.previousNode = null;
            node.isNode = true;
          }
        }
      }
    }
  }

  clearWalls() {
    if (!this.state.isRunning) {
      const newGrid = this.state.grid.slice();
      for (const row of newGrid) {
        for (const node of row) {
          let nodeClassName = document.getElementById(
            `node-${node.row}-${node.col}`,
          ).className;
          if (nodeClassName === 'node node-wall') {
            document.getElementById(`node-${node.row}-${node.col}`).className =
              'node';
            node.isWall = false;
          }
        }
      }
    }
  }
/*
For this function, onClick() sends different switch cases as a string
*/
  visualize(algo) {
    if (!this.state.isRunning) {
      this.clearGrid();
      this.toggleIsRunning();
      const {grid} = this.state;
      const startNode =
        grid[this.state.startRow][this.state.startCol];
      const finishNode =
        grid[this.state.finishRow][this.state.finishCol];
      let openList;
      switch (algo) {
        case 'Djikstra':
          openList = djikstra(grid, startNode, finishNode);
          break;
        case 'AStar':
          openList = AStar(grid, startNode, finishNode);
          break;
        case 'BFS':
          openList = BFS(grid, startNode, finishNode);
          break;
        case 'DFS':
          openList = DFS(grid, startNode, finishNode);
          break;
        default:
          break;
      }
      const pathToTarget = getThePathToTheTarget(finishNode) ;
      pathToTarget.push('end') ;
      this.animate(openList, pathToTarget, algo) ;
  }
}
//openList is the array returned by the algorithms.
  animate(openList, pathToTarget, algo) {
    let DELAY = 10 ;
    if(algo === 'BFS') DELAY = 0.1 ;
    /* delay reduced for bfs to better show how bfs 
    processes all the nodes in its path, and also if the nodes are far apart for 
    bfs, it takes a lot of time which makes the app seem like it is malfunctioning.
    */
    for (let i = 0; i <= openList.length; i++) {
      if (i === openList.length) {
        setTimeout(() => {
          this.animatePathToTheTarget(pathToTarget);
        }, DELAY * i);
        return;
      }
      setTimeout(() => {
        const node = openList[i];
        const nodeClassName = document.getElementById(
          `node-${node.row}-${node.col}`,
        ).className;
        if (
          nodeClassName !== 'node node-start' &&
          nodeClassName !== 'node node-finish'
        ) {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            'node node-visited';
        }
      }, DELAY * i);
    }
  }

  animatePathToTheTarget(pathToTarget) {
    //The shortest path is calculated using the previousNode property of the node.
    for (let i = 0; i < pathToTarget.length; i++) {
      if (pathToTarget[i] === 'end') {
        setTimeout(() => {
          this.toggleIsRunning();
        }, i * 50);
      } else {
        setTimeout(() => {
          const node = pathToTarget[i];
          const nodeClassName = document.getElementById(
            `node-${node.row}-${node.col}`,
          ).className;
          if (
            nodeClassName !== 'node node-start' &&
            nodeClassName !== 'node node-finish'
          ) {
            document.getElementById(`node-${node.row}-${node.col}`).className =
              'node node-shortest-path';
          }
        }, i * 40);
      }
    }
  }

  render() {
    const {grid, mouseIsPressed} = this.state;
    return (
      <div>
        <div className ="project_Name">
          <p>PATHFINDER</p>
        </div>
        <button
          type="button"
          className = "button_2"
          onClick={() => this.visualize('Djikstra')}>
          Djikstra's
        </button>
        <button
          type="button"
          className = "button_2"
          onClick={() => this.visualize('AStar')}>
          A*
        </button>
        <button
          type="button"
          className = "button_2 btn btn-primary"
          onClick={() => this.visualize('BFS')}>
          Breadth First Search
        </button>
        <button
          type="button"
          className = "button_2"
          onClick={() => this.visualize('DFS')}>
          Depth First Search
        </button>
        <table
          className="grid-container"
          onMouseLeave={() => this.handleMouseLeave()}>
          <tbody className="grid">
            {grid.map((row, rowId) => {
              return (
                <tr key={rowId}>
                  {row.map((node, nodeId) => {
                    const {row, col, isFinish, isStart, isWall} = node;
                    return (
                      <Node
                        key={nodeId}
                        col={col}
                        isFinish={isFinish}
                        isStart={isStart}
                        isWall={isWall}
                        mouseIsPressed={mouseIsPressed}
                        onMouseDown={(row, col) => this.handleMouseDown(row, col)}
                        onMouseEnter={(row, col) => this.handleMouseEnter(row, col)}
                        onMouseUp={() => this.handleMouseUp(row, col)}
                        row={row}></Node>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => this.clearGrid()}>
          Reset the Maze
        </button>
        <button
          type="button"
          className="btn btn-warning"
          onClick={() => this.clearWalls()}>
          Break the walls
        </button>
        {this.state.desktop ? (
          <button
            type="button"
            className="button_1"
            onClick={() => this.changeView()}>
            Using A Mobile?
          </button>
        ) : (
          <button
            type="button"
            className = "button_1"
            onClick={() => this.changeView()}>
            Want A Bigger View?
          </button>
        )}
      </div>
    );
  }
}

const toggleWalls = (grid, row, col) => {
  //change the isWall property of the node and vice versa.
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  if (!node.isStart && !node.isFinish && node.isNode) {
    const newNode = {
      ...node,
      isWall: !node.isWall,
    };
    newGrid[row][col] = newNode;
  }
  return newGrid;
};
//Returns the shortest path in case of bfs, djikstra and A* 
//Returns a random path in case of dfs.
function getThePathToTheTarget(finishNode) {
  /*
  Calling the algorithms sets the previousNode property of the nodes to the target.
  We calculate the shortest path by starting with finishNode and going back to 
  the startNode.
   */
  const pathToTarget = [];
  let curr = finishNode;
  //stop when you reach the startNode, whose previousNode = null.
  while (curr !== null) {
    pathToTarget.unshift(curr);
    curr = curr.previousNode;
  }
  return pathToTarget;
}