import React from "react";
import './canvas.css'

const { useEffect, useRef, useState } = React;

const Canvas = () => {
  const canvas = useRef();

  const [isDrawing, setIsDrawing] = useState(false);
  const [start, setStart] = useState();
  const [end, setEnd] = useState();
  const [lines, setLines] = useState([]);

  useEffect(() => {
    if (!canvas.current) return;
    
    const ctx = canvas.current.getContext('2d');
    ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
    if (start && end) {
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.closePath();
        ctx.stroke();

    }

    lines.forEach((line, i) => { 
        ctx.beginPath();
        ctx.moveTo(line.start.x, line.start.y);
        ctx.lineTo(line.end.x, line.end.y);
        ctx.closePath();
        ctx.stroke();

        if (start && end) {
        
            const dot = line_intersect(line.start.x, line.start.y, line.end.x, line.end.y, start.x, start.y, end.x, end.y)

            if (dot) {
                ctx.beginPath();
                ctx.arc(dot.x, dot.y, 2, 0, 2 * Math.PI, false);
                ctx.fillStyle = 'red';
                ctx.fill();
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }

        
        if( i === 0 ) {
            return
        } 
        for (let j = 0; j < lines.length; j++) {
            if ( i === j ) {
                return
            }
            
            const dot = line_intersect(line.start.x, line.start.y, line.end.x, line.end.y, lines[j].start.x, lines[j].start.y, lines[j].end.x, lines[j].end.y)
            
            if (!dot) {
                continue
            }

            ctx.beginPath();
            ctx.arc(dot.x, dot.y, 2, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'red';
            ctx.fill();
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    });

    
  }, [start, end, lines]);



  function mouseclick(e) {
    setIsDrawing(drawingState => !drawingState);
    if (!isDrawing) {
        setStart({ x: e.nativeEvent.offsetX, 
                y: e.nativeEvent.offsetY });
        setEnd({
                    x: e.nativeEvent.offsetX,
                    y: e.nativeEvent.offsetY,
                  });

    } else {
        setLines([
            ...lines,
            {
            start,
            end: { x: e.nativeEvent.offsetX, 
                y: e.nativeEvent.offsetY }
    }])
        setStart(null)
        setEnd(null)
    }
  }
  function mousemove(e) {
    if (!isDrawing) {
        return;
    }
    setEnd({ x: e.nativeEvent.offsetX, 
            y: e.nativeEvent.offsetY })

    };

    function line_intersect(x1, y1, x2, y2, x3, y3, x4, y4) {
        let ua, denom = (y4 - y3)*(x2 - x1) - (x4 - x3)*(y2 - y1);
        if (denom === 0) {
            return null;
        }
        ua = ((x4 - x3)*(y1 - y3) - (y4 - y3)*(x1 - x3))/denom;
        const x = x1 + ua * (x2 - x1);
        const y = y1 + ua * (y2 - y1);

        if ( (x > x1 && x < x2 || x < x1 && x > x2) && (y > y1 && y < y2 || y < y1 && y > y2) &&
            (x > x3 && x < x4 || x < x3 && x > x4) && (y > y3 && y < y4 || y < y3 && y > y4)) {
            return {
                x,
                y
            } 
        }
        return null

    }

   
  
  const onCollapse = e => {
    const steps = lines.map(({start, end}) => {
      const middle = {
        x: (start.x + end.x) /2,
        y: (start.y + end.y)/2
      }

      const stepStart = {
        x: (start.x - middle.x) / 100,
        y: (start.y - middle.y) / 100
      }
      const stepEnd = {
        x: (end.x - middle.x) / 100,
        y: (end.y - middle.y) / 100
      }
      const step = {
        start: stepStart,
        end: stepEnd
      }
      return step
    })
    
    const deleteLines = setInterval(() => {
      setLines(l => {
      const res = l.map(({start,end}, i) => {
        const line = {
          start: {
            x: start.x,
            y: start.y
          },
          end: {
            x: end.x,
            y: end.y
          },
        };
          line.start.x = start.x - steps[i].start.x;
          line.end.x = end.x - steps[i].end.x;

          line.start.y = start.y - steps[i].start.y; 
          line.end.y = end.y - steps[i].end.y;

        return line;
      }).filter((line) => {
        return Math.round(line.start.x) !== Math.round(line.end.x) && Math.round(line.start.y) !== Math.round(line.end.y)})
      if ( res.length === 0 ) {
          clearInterval(deleteLines)
      }
      return res
      }
    )
    }, 30)
  };


  return (
    <div className="main">
      <canvas
        id="canvas"
        ref={canvas}
        onMouseDown={mouseclick}
        onMouseMove={mousemove}
        width="500"
        height="500"
        className="canvas"
      ></canvas>
      <button onClick={onCollapse}
                className='button'>
        Collapse Lines
      </button>
    </div>
  );
};

export default Canvas;