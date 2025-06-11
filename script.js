const editor = document.getElementById('editor');
const zoomSlider = document.getElementById('zoomSlider');
const rotateBtn = document.getElementById('rotateBtn');
const clearBtn = document.getElementById('clearBtn');
const downloadBtn = document.getElementById('downloadBtn');
const toggleEdit = document.getElementById('toggleEdit');
const imageUploader = document.getElementById('imageUploader');
const pricePerImage = 1.00;
const pricePerText = 0.50;
const bottleSizeBasePrice = {
    small: 7.50,
    medium: 9.00,
    large: 10.50
};

let rotation = 0;
let editMode = false;

zoomSlider.addEventListener('input', () => {
    editor.style.transform = `scale(${zoomSlider.value}) rotate(${rotation}deg)`;
});

rotateBtn.addEventListener('click', () => {
    rotation += 90;
    editor.style.transform = `scale(${zoomSlider.value}) rotate(${rotation}deg)`;
});

clearBtn.addEventListener('click', () => {
    editor.querySelectorAll('.custom-element').forEach(el => el.remove());
});

downloadBtn.addEventListener('click', () => {
    html2canvas(editor).then(canvas => {
        const link = document.createElement('a');
        link.download = 'bottle.png';
        link.href = canvas.toDataURL();
        link.click();
    });
});

toggleEdit.addEventListener('click', () => {
    editMode = !editMode;
    toggleEdit.title = editMode ? "Disable Edit Mode" : "Enable Edit Mode";
    toggleDraggable(editMode);
});

document.getElementById('addImageBtn').addEventListener('click', () => {
    imageUploader.click();
});

imageUploader.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        const img = document.createElement('img');
        img.src = evt.target.result;
        img.className = 'custom-element';
        img.style.position = 'absolute';
        img.style.top = '50%';
        img.style.left = '50%';
        img.style.width = '80px';
        img.style.cursor = 'move';
        editor.appendChild(img);
        makeInteractable(img);
    };
    reader.readAsDataURL(file);
});

document.getElementById('addTextBtn').addEventListener('click', () => {
    const text = document.createElement('div');
    text.className = 'custom-element';
    text.innerText = 'Label Text';
    text.style.position = 'absolute';
    text.style.top = '60%';
    text.style.left = '50%';
    text.style.color = 'black';
    text.style.fontSize = '16px';
    text.style.fontWeight = 'bold';
    text.style.background = 'transparent';
    text.style.padding = '4px';
    text.style.cursor = 'move';
    text.setAttribute('contenteditable', editMode);
    if (editMode) text.classList.add('edit-border');
    editor.appendChild(text);
    makeInteractable(text);
});


function toggleDraggable(enabled) {
    const elements = document.querySelectorAll('.custom-element');
    elements.forEach(el => {
        el.style.pointerEvents = enabled ? 'auto' : 'none';
        el.setAttribute('contenteditable', enabled && el.tagName === 'DIV');
        if (enabled && el.tagName === 'DIV') {
            el.classList.add('edit-border');
        } else {
            el.classList.remove('edit-border');
        }
        if (enabled) {
            makeInteractable(el);
        }
    });
}


function makeInteractable(el) {
    interact(el)
        .draggable({
            enabled: editMode,
            listeners: {
                move(event) {
                    const target = event.target;
                    const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                    const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
                    target.style.transform = `translate(${x}px, ${y}px) rotate(${target.getAttribute('data-rot') || 0}deg)`;
                    target.setAttribute('data-x', x);
                    target.setAttribute('data-y', y);
                }
            }
        })
        .resizable({
            edges: { left: true, right: true, bottom: true, top: true },
            listeners: {
                move(event) {
                    let { x, y } = event.target.dataset;
                    x = parseFloat(x) || 0;
                    y = parseFloat(y) || 0;
                    Object.assign(event.target.style, {
                        width: `${event.rect.width}px`,
                        height: `${event.rect.height}px`,
                        transform: `translate(${x}px, ${y}px) rotate(${event.target.getAttribute('data-rot') || 0}deg)`
                    });
                }
            }
        })
        .gesturable({
            listeners: {
                move(event) {
                    const currentRotation = parseFloat(event.target.getAttribute('data-rot')) || 0;
                    const newRotation = currentRotation + event.da;
                    event.target.style.transform = `translate(${event.target.getAttribute('data-x') || 0}px, ${event.target.getAttribute('data-y') || 0}px) rotate(${newRotation}deg)`;
                    event.target.setAttribute('data-rot', newRotation);
                }
            }
        });
}

let selectedBottleSize = 'medium'; 

function setBottleSize(size) {
    selectedBottleSize = size;
    updateTotal();
}

function updateTotal() {
    const imageCount = document.querySelectorAll('.custom-element img').length;
    const textCount = document.querySelectorAll('.custom-element div').length;
    const basePrice = bottleSizeBasePrice[selectedBottleSize] || 7.50;
    const total = basePrice + (imageCount * pricePerImage) + (textCount * pricePerText);
    document.getElementById('totalAmount').textContent = total.toFixed(2);
}

const observer = new MutationObserver(updateTotal);
observer.observe(document.getElementById('editor'), { childList: true, subtree: true });
document.addEventListener('DOMContentLoaded', updateTotal);