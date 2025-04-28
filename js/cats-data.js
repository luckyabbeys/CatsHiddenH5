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
    }
];

// 从localStorage加载猫咪位置数据（如果有）
function loadCatsPositions() {
    const savedPositions = localStorage.getItem('catsPositions');
    const savedBackgroundInfo = localStorage.getItem('backgroundInfo');
    
    if (savedPositions) {
        const positions = JSON.parse(savedPositions);
        let backgroundInfo = null;
        
        // 尝试加载背景图信息
        if (savedBackgroundInfo) {
            try {
                backgroundInfo = JSON.parse(savedBackgroundInfo);
                console.log(`加载背景图信息: 缩放比例=${backgroundInfo.ratio.toFixed(4)}, 偏移量=(${backgroundInfo.offsetX.toFixed(0)},${backgroundInfo.offsetY.toFixed(0)}), 缩放尺寸=${backgroundInfo.scaledWidth.toFixed(0)}x${backgroundInfo.scaledHeight.toFixed(0)}`);
            } catch (e) {
                console.error('解析背景图信息失败:', e);
            }
        }
        
        positions.forEach((pos, index) => {
            if (index < catsData.length) {
                // 直接使用保存的坐标，不再应用校正
                // 这样可以确保在刷新页面后，猫咪位置保持不变
                const savedX = pos.x;
                const savedY = pos.y;
                
                // 记录原始位置，用于调试
                console.log(`猫咪 ${catsData[index].id} 加载保存的位置: (${savedX.toFixed(4)}, ${savedY.toFixed(4)})`);
                
                // 直接应用保存的坐标，并确保在有效范围内
                catsData[index].x = Math.max(0.02, Math.min(savedX, 0.98));
                catsData[index].y = Math.max(0.02, Math.min(savedY, 0.98));
                console.log(`加载猫咪 ${catsData[index].id}(${catsData[index].name}): 坐标(x=${catsData[index].x.toFixed(4)}, y=${catsData[index].y.toFixed(4)})`);
            }
        });
        console.log(`成功从本地存储加载了${positions.length}只猫咪的位置数据`);
    } else {
        console.log('未找到保存的猫咪位置数据，使用默认位置');
    }
}

// 保存猫咪位置数据到localStorage
function saveCatsPositions() {
    // 获取当前的缩放系数（从window对象获取，因为scale变量在game.js中定义）
    const currentScale = window.scale || 1;
    
    // 获取背景图元素和容器尺寸
    const background = document.getElementById('background');
    const backgroundRect = background.getBoundingClientRect();
    const containerWidth = backgroundRect.width;
    const containerHeight = backgroundRect.height;
    
    // 计算背景图的实际显示尺寸
    const backgroundNaturalWidth = background.naturalWidth;
    const backgroundNaturalHeight = background.naturalHeight;
    
    // 输出调试信息
    console.log(`调试模式 - 保存猫咪位置，当前缩放系数: ${currentScale.toFixed(4)}`);
    console.log(`调试模式 - 背景图原始尺寸: ${backgroundNaturalWidth}x${backgroundNaturalHeight}, 容器尺寸: ${containerWidth}x${containerHeight}`);
    
    // 确保所有猫咪坐标在有效范围内
    catsData.forEach(cat => {
        // 限制坐标在0.02到0.98之间，避免猫咪跑到边界外
        cat.x = Math.max(0.02, Math.min(cat.x, 0.98));
        cat.y = Math.max(0.02, Math.min(cat.y, 0.98));
        console.log(`调试模式 - 保存猫咪 ${cat.id}(${cat.name}): 坐标(x=${cat.x.toFixed(4)}, y=${cat.y.toFixed(4)})`);
    });
    
    // 计算背景图的实际缩放比例
    let scaleRatio;
    if (backgroundNaturalWidth / backgroundNaturalHeight > containerWidth / containerHeight) {
        // 宽度适配，高度居中
        scaleRatio = containerWidth / backgroundNaturalWidth;
    } else {
        // 高度适配，宽度居中
        scaleRatio = containerHeight / backgroundNaturalHeight;
    }
    
    // 计算背景图的实际显示尺寸
    const scaledWidth = backgroundNaturalWidth * scaleRatio;
    const scaledHeight = backgroundNaturalHeight * scaleRatio;
    
    // 计算背景图的实际显示位置（考虑居中）
    const offsetX = (containerWidth - scaledWidth) / 2;
    const offsetY = (containerHeight - scaledHeight) / 2;
    
    // 保存猫咪位置和背景图信息
    const positions = catsData.map(cat => ({
        x: cat.x,
        y: cat.y
    }));
    
    // 保存背景图信息，以便在加载时进行校正
    const backgroundInfo = {
        ratio: scaleRatio,
        offsetX: offsetX,
        offsetY: offsetY,
        containerWidth: containerWidth,
        containerHeight: containerHeight,
        scaledWidth: scaledWidth,
        scaledHeight: scaledHeight
    };
    
    // 保存到localStorage
    localStorage.setItem('catsPositions', JSON.stringify(positions));
    localStorage.setItem('backgroundInfo', JSON.stringify(backgroundInfo));
    
    console.log(`调试模式 - 保存背景图信息: 缩放比例=${scaleRatio.toFixed(4)}, 偏移量=(${offsetX.toFixed(0)},${offsetY.toFixed(0)}), 缩放尺寸=${scaledWidth.toFixed(0)}x${scaledHeight.toFixed(0)}`);
    
    // 显示保存成功的提示
    alert(`已成功保存${catsData.length}只猫咪的位置！刷新页面后位置将保持不变。`);
}

// 初始化加载猫咪位置
loadCatsPositions();