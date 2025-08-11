/**
 * 更新导航栏中的电子时钟
 */
function updateClock() {
    // 1. 通过 ID 找到页面上的时钟元素
    const clockElement = document.getElementById('digital-clock');

    // 如果在当前页面找不到这个元素（以防万一），就直接停止执行，避免报错
    if (!clockElement) {
        return;
    }

    // 2. 获取当前的日期和时间
    const now = new Date();

    // 3. 将小时、分钟、秒格式化为两位数（例如，7 -> 07）
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    // 4. 拼接成 "HH:MM:SS" 格式的时间字符串
    const timeString = `${hours}:${minutes}:${seconds}`;

    // 5. 将生成的时间字符串设置为时钟元素的文本内容
    clockElement.textContent = timeString;
}

// 首次加载时，立即执行一次 updateClock 函数，避免页面刚打开时时钟是空白的
document.addEventListener('DOMContentLoaded', updateClock);

// 设置一个定时器，每隔 1000 毫秒（即 1 秒）调用一次 updateClock 函数，实现时钟的动态更新
setInterval(updateClock, 1000);