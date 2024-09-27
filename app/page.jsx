"use client";

import React, { useState, useRef, useEffect } from "react";

const CircleCanvas = () => {
  const canvasRef = useRef(null);
  const [circleCount, setCircleCount] = useState(0);
  const [circles, setCircles] = useState([]);
  const [nextCircleId, setNextCircleId] = useState(1); // Số thứ tự hình tròn cần click
  const [timer, setTimer] = useState(0); // Thời gian đếm
  const [gameMessage, setGameMessage] = useState("LET'S PLAY"); // Thông báo trò chơi
  const [intervalId, setIntervalId] = useState(null); // Lưu ID của interval để có thể dừng

  const RADIUS = 24; // Bán kính cố định cho tất cả hình tròn

  // Hàm tạo hình tròn ngẫu nhiên nhưng cùng bán kính
  const generateRandomCircles = (count, canvasWidth, canvasHeight) => {
    const newCircles = [];
    for (let i = 0; i < count; i++) {
      const x = Math.random() * (canvasWidth - 2 * RADIUS) + RADIUS;
      const y = Math.random() * (canvasHeight - 2 * RADIUS) + RADIUS;
      newCircles.push({ x, y, radius: RADIUS, color: "rgb(255, 255, 255)", id: i + 1, transitionProgress: 0 });
    }
    return newCircles;
  };

  // Vẽ các hình tròn và đánh số thứ tự
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Xóa canvas trước khi vẽ lại
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Vẽ hình tròn và đánh số thứ tự
        circles.forEach((circle) => {
          // Vẽ hình tròn
          ctx.beginPath();
          ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
          ctx.fillStyle = circle.color;
          ctx.fill();
          ctx.stroke();

          // Đánh số thứ tự vào giữa hình tròn
          ctx.fillStyle = "black"; // Màu cho số thứ tự
          ctx.font = "bold 16px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(circle.id, circle.x, circle.y);
        });
      }
    }
  }, [circles]);

  // Xử lý khi người dùng bấm nút để vẽ hình tròn
  const handleDrawCircles = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const newCircles = generateRandomCircles(circleCount, canvas.width, canvas.height);
      setCircles(newCircles); // Cập nhật state với các hình tròn mới
      setNextCircleId(1); // Đặt lại số thứ tự hình tròn cần click về 1
      setTimer(0); // Đặt lại thời gian
      setGameMessage("LET'S PLAY"); // Đặt lại thông báo trò chơi

      // Bắt đầu đếm thời gian
      if (intervalId) clearInterval(intervalId); // Dừng đồng hồ nếu đang chạy
      const id = setInterval(() => {
        setTimer((prev) => prev + 0.1); // Tăng thời gian mỗi 0.1 giây
      }, 100); // Cập nhật mỗi 100ms
      setIntervalId(id); // Lưu ID để có thể dừng
    }
  };

  // Hàm chuyển màu dần dần từ trắng sang đỏ
  const gradualColorChange = (circleId) => {
    setCircles((prevCircles) =>
      prevCircles.map((circle) => {
        if (circle.id === circleId) {
          let progress = circle.transitionProgress + 0.02; // Tăng tiến trình chuyển màu
          if (progress >= 1) {
            progress = 1; // Đảm bảo giá trị không vượt quá 1
          }
          const newColor = `rgb(255, ${Math.round(255 * (1 - progress))}, ${Math.round(255 * (1 - progress))})`;
          return { ...circle, color: newColor, transitionProgress: progress };
        }
        return circle;
      })
    );
  };

  // Xử lý khi click vào canvas để kiểm tra và đổi màu hình tròn đúng thứ tự
  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      // Tìm xem có hình tròn nào được click
      let clickedCircle = null;

      circles.forEach((circle) => {
        const distance = Math.sqrt((mouseX - circle.x) ** 2 + (mouseY - circle.y) ** 2);
        if (distance <= circle.radius) {
          clickedCircle = circle; // Lưu hình tròn được click
        }
      });

      if (clickedCircle) {
        // Kiểm tra nếu người dùng click đúng hình tròn theo thứ tự
        if (clickedCircle.id === nextCircleId) {
          setNextCircleId((prevId) => prevId + 1); // Tăng số thứ tự hình tròn cần click tiếp theo
          // Nếu click đúng hình tròn theo thứ tự, bắt đầu quá trình chuyển màu
          const animationId = setInterval(() => {
            gradualColorChange(clickedCircle.id);
          }, 50); // Cập nhật mỗi 50ms

          // Sau 2 giây, xóa hình tròn khỏi danh sách và dừng animation
          setTimeout(() => {
            clearInterval(animationId); // Dừng chuyển màu
            setCircles((prevCircles) => prevCircles.filter((c) => c.id !== clickedCircle.id)); // Xóa hình tròn

            // Nếu tất cả hình tròn đã được chọn, cập nhật thông báo
            if (nextCircleId >= circleCount) {
              setGameMessage("ALL CLEARED"); // Cập nhật thông báo khi thắng
              clearInterval(intervalId); // Dừng đồng hồ
            }
          }, 2000); // 2 giây
        } else {
          // Nếu click sai thứ tự, dừng đồng hồ và hiển thị GAME OVER
          setGameMessage("GAME OVER"); // Cập nhật thông báo GAME OVER
          clearInterval(intervalId); // Dừng đồng hồ
        }
      }
    }
  };

  // Xử lý khi di chuột trên canvas để thay đổi cursor nếu hover vào hình tròn
  const handleMouseMove = (event) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      let isHovering = false;

      // Kiểm tra xem có hình tròn nào được hover
      circles.forEach((circle) => {
        const distance = Math.sqrt((mouseX - circle.x) ** 2 + (mouseY - circle.y) ** 2);
        if (distance <= circle.radius) {
          isHovering = true;
        }
      });

      // Đổi con trỏ chuột thành "pointer" khi hover vào hình tròn
      canvas.style.cursor = isHovering ? "pointer" : "default";
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pt-0 pb-20 gap-2">
      <div className="flex flex-col gap-2 row-start-2 items-center sm:items-start">
        <h2 className="font-bold" style={{ color: gameMessage === "GAME OVER" ? "red" : gameMessage === "ALL CLEARED" ? "green" : "black" }}>
          {gameMessage} {/* Hiển thị thông báo trò chơi */}
        </h2>
        <div className="flex gap-2 font-medium">
          <h3>Points:</h3>
          <input
            type="number"
            value={circleCount}
            onChange={(e) => setCircleCount(Number(e.target.value))}
            placeholder="Nhập số lượng hình tròn"
          />
        </div>
        <h3 className="font-medium">Time: {timer.toFixed(1)}s</h3> {/* Hiển thị thời gian */}
        <button className="border border-gray-600 bg-gray-700 text-white py-2 px-4 rounded hover:bg-gray-600"
          onClick={handleDrawCircles}>Restart</button>
        <canvas
          ref={canvasRef}
          width="500"
          height="450"
          style={{ border: "2px solid black", marginTop: "20px" }}
          onClick={handleCanvasClick} // Thêm sự kiện click vào canvas
          onMouseMove={handleMouseMove} // Thêm sự kiện di chuột để thay đổi con trỏ
        />
            </div>
      </div>
  );
};

export default CircleCanvas;
