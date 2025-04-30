// 猫咪数据
const catsData = [
    {
        id: 1,
        name: "小花",
        image: "./images/cat1.png",
        x: 0.2, // 相对于背景图的x坐标比例
        y: 0.3, // 相对于背景图的y坐标比例
        found: false
    },
    {
        id: 2,
        name: "黑豆",
        image: "./images/cat2.png",
        x: 0.5,
        y: 0.6,
        found: false
    },
    {
        id: 3,
        name: "橘子",
        image: "./images/cat3.png",
        x: 0.8,
        y: 0.2,
        found: false
    },
    {
        id: 4,
        name: "雪球",
        image: "./images/cat4.png",
        x: 0.3,
        y: 0.7,
        found: false
    },
    {
        id: 5,
        name: "灰灰",
        image: "./images/cat5.png",
        x: 0.7,
        y: 0.5,
        found: false
    },
    {
        id: 6,
        name: "奶油",
        image: "./images/cat6.png",
        x: 0.1,
        y: 0.8,
        found: false
    },
    {
        id: 7,
        name: "咖啡",
        image: "./images/cat7.png",
        x: 0.9,
        y: 0.4,
        found: false
    },
    {
        id: 8,
        name: "豆豆",
        image: "./images/cat8.png",
        x: 0.4,
        y: 0.1,
        found: false
    },
    {
        id: 9,
        name: "斑斑",
        image: "./images/cat9.png",
        x: 0.6,
        y: 0.9,
        found: false
    },
    {
        id: 10,
        name: "毛毛",
        image: "./images/cat10.png",
        x: 0.2,
        y: 0.5,
        found: false
    },
    {
      id: 11,
      name: "花卷",
      image: "./images/cat11.png",
      x: 0.6,
      y: 0.6,
      found: false
    },
    {
    id: 12,
    name: "布丁",
    image: "./images/cat12.png",
    x: 0.3,
    y: 0.7,
    found: false
    },
    {
      id: 13,
      name: "糖糖",
      image: "./images/cat13.png",
      x: 0.7,
      y: 0.7,
      found: false
    },
    {
      id: 14,
      name: "酥酥",
      image: "./images/cat14.png",
      x: 0.8,
      y: 0.8,
      found: false
    },
    {
      id: 15,
      name: "米米",
      image: "./images/cat15.png",
      x: 0.3,
      y: 0.9,
      found: false
    }
];

// 从localStorage加载猫咪位置数据（如果有）
function loadCatsPositions() {
    const savedData = localStorage.getItem('catsPositions');
    
    if (savedData) {
        // 解析保存的数据
        const data = JSON.parse(savedData);
        
        // 检查数据格式，兼容新旧两种格式
        if (data.positions && data.backgroundWidth && data.backgroundHeight) {
            // 新格式：使用绝对像素坐标
            const positions = data.positions;
            const savedBackgroundWidth = data.backgroundWidth;
            const savedBackgroundHeight = data.backgroundHeight;
            
            console.log(`加载猫咪位置 - 保存时的背景图尺寸: ${savedBackgroundWidth}x${savedBackgroundHeight}`);
            
            // 获取当前背景图尺寸
            const background = document.getElementById('background');
            const currentBackgroundWidth = background.naturalWidth;
            const currentBackgroundHeight = background.naturalHeight;
            
            console.log(`加载猫咪位置 - 当前背景图尺寸: ${currentBackgroundWidth}x${currentBackgroundHeight}`);
            
            // 注意：此时validCats数组可能还未创建，所以我们只能更新catsData
            // 在游戏初始化时，createCats函数会检查图片是否存在，并创建有效猫咪数组
            positions.forEach((pos, index) => {
                if (index < catsData.length) {
                    // 从绝对像素坐标转换为相对坐标
                    const relativeX = pos.x / savedBackgroundWidth;
                    const relativeY = pos.y / savedBackgroundHeight;
                    
                    // 记录加载的绝对位置，用于调试
                    console.log(`猫咪 ${catsData[index].id} 加载保存的绝对位置: (${pos.x}px, ${pos.y}px)`);
                    
                    // 应用相对坐标，确保在有效范围内（0.02-0.98）
                    catsData[index].x = Math.max(0.02, Math.min(relativeX, 0.98));
                    catsData[index].y = Math.max(0.02, Math.min(relativeY, 0.98));
                    
                    // 计算当前绝对像素位置用于显示
                    const currentAbsoluteX = Math.round(catsData[index].x * currentBackgroundWidth);
                    const currentAbsoluteY = Math.round(catsData[index].y * currentBackgroundHeight);
                    
                    console.log(`加载猫咪 ${catsData[index].id}(${catsData[index].name}): 当前绝对坐标(${currentAbsoluteX}px, ${currentAbsoluteY}px), 相对坐标(${catsData[index].x.toFixed(4)}, ${catsData[index].y.toFixed(4)})`);
                }
            });
            console.log(`成功从本地存储加载了${positions.length}只猫咪的位置数据（绝对像素坐标）`);
        } else {
            // 旧格式：使用相对坐标
            const positions = data;
            
            positions.forEach((pos, index) => {
                if (index < catsData.length) {
                    // 直接使用保存的相对坐标
                    const savedX = pos.x;
                    const savedY = pos.y;
                    
                    // 记录原始位置，用于调试
                    console.log(`猫咪 ${catsData[index].id} 加载保存的相对位置: (${savedX.toFixed(4)}, ${savedY.toFixed(4)})`);
                    
                    // 直接应用保存的坐标，不进行任何缩放处理
                    // 确保在有效范围内（0.02-0.98）
                    catsData[index].x = Math.max(0.02, Math.min(savedX, 0.98));
                    catsData[index].y = Math.max(0.02, Math.min(savedY, 0.98));
                    
                    // 获取当前背景图尺寸
                    const background = document.getElementById('background');
                    const currentBackgroundWidth = background.naturalWidth;
                    const currentBackgroundHeight = background.naturalHeight;
                    
                    // 计算当前绝对像素位置用于显示
                    const currentAbsoluteX = Math.round(catsData[index].x * currentBackgroundWidth);
                    const currentAbsoluteY = Math.round(catsData[index].y * currentBackgroundHeight);
                    
                    console.log(`加载猫咪 ${catsData[index].id}(${catsData[index].name}): 当前绝对坐标(${currentAbsoluteX}px, ${currentAbsoluteY}px), 相对坐标(${catsData[index].x.toFixed(4)}, ${catsData[index].y.toFixed(4)})`);
                }
            });
            console.log(`成功从本地存储加载了${positions.length}只猫咪的位置数据（相对坐标）`);
        }
    } else {
        console.log('未找到保存的猫咪位置数据，使用默认位置');
    }
}

// 保存猫咪位置数据到localStorage
function saveCatsPositions() {
    // 获取背景图元素和原始尺寸
    const background = document.getElementById('background');
    const backgroundNaturalWidth = background.naturalWidth;
    const backgroundNaturalHeight = background.naturalHeight;
    
    // 输出调试信息
    console.log(`调试模式 - 保存猫咪位置`);
    console.log(`调试模式 - 背景图原始尺寸: ${backgroundNaturalWidth}x${backgroundNaturalHeight}`);
    
    // 使用validCats数组而不是catsData，确保只保存有效的猫咪位置
    const validCatsArray = window.validCats || [];
    
    // 确保所有猫咪坐标在有效范围内并转换为绝对像素坐标
    const positions = validCatsArray.map(cat => {
        // 限制坐标在0.02到0.98之间，避免猫咪跑到边界外
        cat.x = Math.max(0.02, Math.min(cat.x, 0.98));
        cat.y = Math.max(0.02, Math.min(cat.y, 0.98));
        
        // 计算绝对像素坐标
        const absoluteX = Math.round(cat.x * backgroundNaturalWidth);
        const absoluteY = Math.round(cat.y * backgroundNaturalHeight);
        
        console.log(`调试模式 - 保存猫咪 ${cat.id}(${cat.name}): 绝对坐标(${absoluteX}px, ${absoluteY}px), 相对坐标(${cat.x.toFixed(4)}, ${cat.y.toFixed(4)})`);
        
        // 返回绝对像素坐标用于保存
        return {
            x: absoluteX,
            y: absoluteY
        };
    });
    
    // 同时保存背景图尺寸，用于后续加载时计算相对坐标
    const saveData = {
        positions: positions,
        backgroundWidth: backgroundNaturalWidth,
        backgroundHeight: backgroundNaturalHeight
    };
    
    // 保存到localStorage
    localStorage.setItem('catsPositions', JSON.stringify(saveData));
    
    // 显示保存成功的提示，使用validCats数组的长度
    alert(`已成功保存${validCatsArray.length}只猫咪的位置！刷新页面后位置将保持不变。`);
}

// 初始化加载猫咪位置
loadCatsPositions();