window.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById("result");
    
    btn?.addEventListener('click', async () => {
        const fname = document.getElementById("firstname")?.value.trim() || '';
        const mname = document.getElementById("midname")?.value.trim() || '';
        const lname = document.getElementById("lastname")?.value.trim() || '';

        if (!isValid(fname) || !isValid(mname) || !isValid(lname)) return;

        toggleLoading(true);

        const r = nameToNum(fname.toLowerCase());
        const g = nameToNum(mname.toLowerCase());
        const b = nameToNum(lname.toLowerCase());
        const mainHex = rgbToHex(r, g, b);

        try {
            const mainData = await fetchColorName(mainHex);
            const hslObj = rgbToHslObject(r, g, b); 
            
            // Palette calculations
            const p1Hex = hslToHex((hslObj.h + 30) % 360, hslObj.s +5 , hslObj.l -5);
            const p2Hex = hslToHex((hslObj.h + 330) % 360, hslObj.s -10, hslObj.l +5);
            const p3Hex = hslToHex((hslObj.h + 155) % 360, hslObj.s +10, hslObj.l -15);

            const p1Data = await fetchColorName(p1Hex);
            const p2Data = await fetchColorName(p2Hex);
            const p3Data = await fetchColorName(p3Hex);

            // 1. Update Main Result
            document.getElementById('box').style.fill = mainHex;
            document.getElementById("colourname").textContent = mainData.name;
            document.getElementById("chex").textContent = `HEX: ${mainHex.toUpperCase()}`;
            document.getElementById("crgb").textContent = `RGB: ${r}, ${g}, ${b}`;
            document.getElementById("chsl").textContent = `HSL: ${hslObj.h}°, ${hslObj.s}%, ${hslObj.l}%`;

            // 2. Update Palette UI
            document.getElementById("c1box").style.fill = p1Hex;
            document.getElementById("c1name").textContent = p1Data.name;
            document.getElementById("c1hex").textContent = p1Hex.toUpperCase();
            
            document.getElementById("c2box").style.fill = p2Hex;
            document.getElementById("c2name").textContent = p2Data.name;
            document.getElementById("c2hex").textContent = p2Hex.toUpperCase();
            
            document.getElementById("c3box").style.fill = p3Hex;
            document.getElementById("c3name").textContent = p3Data.name;
            document.getElementById("c3hex").textContent = p3Hex.toUpperCase();

            // 3. Update Doodles
            document.getElementById("sun").style.fill = p1Hex;
            document.getElementById("sparkle").style.fill = p2Hex;
            document.getElementById("star").style.fill = p3Hex;

            // Switch Pages
            document.getElementById("page1").style.display = "none";
            document.getElementById("page2").style.display = "flex";

        } catch (err) {
            console.error("Pizza delivery failed!", err);
        } finally {
            toggleLoading(false);
        }
    });
});

// --- CORE HELPERS ---

async function fetchColorName(hex) {
    const cleanHex = hex.replace('#', '');
    const response = await fetch(`https://api.color.pizza/v1/?values=${cleanHex}`);
    const data = await response.json();
    return data.colors[0]; 
}

function nameToNum(name) {
    const numlet = {a:1,b:2,c:3,d:4,e:5,f:6,g:7,h:8,i:9,j:10,k:11,l:12,m:13,n:14,o:15,p:16,q:17,r:18,s:19,t:20,u:21,v:22,w:23,x:24,y:25,z:26};
    let total = [...name].reduce((acc, char) => acc + (numlet[char] || 0), 0);
    return (total * 4) % 256;
}

function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function hslToHex(h, s, l) {
    l /= 100; s /= 100;
    let a = s * Math.min(l, 1 - l);
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

function rgbToHslObject(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; } 
    else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function isValid(string) {
    return /^[a-zA-Z\s]+$/.test(string);
}

function toggleLoading(show) {
    const loader = document.getElementById("loading-popup");
    
    if (loader) loader.style.display = show ? "flex" : "none";
}