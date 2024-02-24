const canvas = new fabric.Canvas("whiteboard", {
  isDrawingMode: false,
  selection: true,
});

let currentShape = null;
let currentColor = "#000000";
let shapeFunctionalityEnabled = true; // Shapes functionality starts as 'On'.
let currentTransparency = 1; // 1 means fully opaque

function toggleShapeFunctionality() {
  shapeFunctionalityEnabled = !shapeFunctionalityEnabled;
  const shapeToggleButton = document.getElementById("shape-toggle-button");
  shapeToggleButton.innerText = shapeFunctionalityEnabled ? "On" : "Off";
  canvas.defaultCursor = shapeFunctionalityEnabled ? "crosshair" : "default";
  canvas.isDrawingMode = false;
}

function setShape(shape) {
  currentShape = shape;
  canvas.isDrawingMode = false;
}

function setColor() {
  currentColor = document.getElementById("color-picker").value;
  canvas.freeDrawingBrush.color = currentColor;

  // Update the color of the selected object, if any
  const activeObject = canvas.getActiveObject();
  if (activeObject) {
    activeObject.set("fill", currentColor);
    canvas.renderAll();
  }
}

function drawSquare(pointer) {
  const square = new fabric.Rect({
    left: pointer.x - 25,
    top: pointer.y - 25,
    width: 50,
    height: 50,
    fill: currentColor,
    opacity: currentTransparency,
  });

  canvas.add(square);
}

function drawCircle(pointer) {
  const circle = new fabric.Circle({
    left: pointer.x,
    top: pointer.y,
    radius: 25,
    fill: currentColor,
    opacity: currentTransparency,
  });

  canvas.add(circle);
}

function drawTriangle(pointer) {
  const triangle = new fabric.Triangle({
    left: pointer.x,
    top: pointer.y,
    width: 50,
    height: 50,
    fill: currentColor,
    opacity: currentTransparency,
  });

  canvas.add(triangle);
}
function drawRectangle(pointer) {
  const rect = new fabric.Rect({
    left: pointer.x - 50,
    top: pointer.y - 25,
    width: 100,
    height: 50,
    fill: currentColor,
    opacity: currentTransparency,
  });

  canvas.add(rect);
}

function addText() {
  const textValue = document.getElementById("text-input").value;
  const fontFamily = document.getElementById("font-family-select").value;

  const text = new fabric.IText(textValue, {
    left: 50,
    top: 50,
    fill: currentColor,
    fontFamily: fontFamily,
    fontWeight: "",
    fontStyle: "",
    underline: false,
    opacity: currentTransparency,
  });

  canvas.add(text);
}

function saveImage() {
  const fileNameInput = document.getElementById("file-name-input");
  const fileName = fileNameInput.value.trim(); // Get the entered file name

  if (!fileName) {
    alert("Please enter a valid file name.");
    return;
  }

  const imageQuality = document.getElementById("image-quality-select").value;
  let multiplier = 1;
  switch (imageQuality) {
    case "1080p":
      multiplier = 1;
      break;
    case "2160p":
      multiplier = 2;
      break;
    case "4K":
      multiplier = 4;
      break;
      case "8K":
      multiplier = 8;
      break;

  }

  const dataURL = canvas.toDataURL({
    format: "png",
    multiplier: multiplier,
  });

  const link = document.createElement("a");
  link.href = dataURL;
  link.download = `${fileName}.png`; // Use the entered file name with .png extension
  link.click();
}


function deselectShapes() {
  canvas.discardActiveObject();
  canvas.renderAll();
  currentShape = null;
  currentTransparency = 1; // Reset transparency to fully opaque
  updateTransparencyDisplay();
}

function changeColor() {
  const activeObject = canvas.getActiveObject();
  if (activeObject) {
    activeObject.set("fill", currentColor);
    canvas.renderAll();
  }
}

function moveForward() {
  const activeObject = canvas.getActiveObject();
  if (activeObject) {
    canvas.bringForward(activeObject);
  }
}

function moveBackward() {
  const activeObject = canvas.getActiveObject();
  if (activeObject) {
    canvas.sendBackwards(activeObject);
  }
}

function deleteSelectedObject() {
  const activeObject = canvas.getActiveObject();
  if (activeObject) {
    canvas.remove(activeObject);
  }
}

function duplicateObject() {
  const activeObject = canvas.getActiveObject();
  if (activeObject) {
    const duplicate = fabric.util.object.clone(activeObject);
    duplicate.set({
      left: activeObject.left + 20,
      top: activeObject.top + 20,
      hasControls: true, // Enable controls for the duplicate
      hasBorders: true, // Enable borders for the duplicate
      selectable: true, // Enable selection for the duplicate
    });
    canvas.add(duplicate);
    canvas.setActiveObject(duplicate);
    canvas.renderAll();
  }
}

// Event listener for drawing shapes
canvas.on("mouse:down", function (options) {
  if (shapeFunctionalityEnabled && currentShape !== "text") {
    const pointer = canvas.getPointer(options.e);

    if (currentShape === "square") {
      drawSquare(pointer);
    } else if (currentShape === "circle") {
      drawCircle(pointer);
    } else if (currentShape === "triangle") {
      drawTriangle(pointer);
    }
  }
});

// Event listener for selection update
canvas.on("selection:updated", function (options) {
  const activeObject = options.target;
  if (activeObject && activeObject.type === "i-text") {
    const fontFamilySelect = document.getElementById("font-family-select");
    fontFamilySelect.value = activeObject.fontFamily;

    const boldButton = document.getElementById("bold-button");
    const italicButton = document.getElementById("italic-button");
    const underlineButton = document.getElementById("underline-button");

    boldButton.classList.toggle("active", activeObject.fontWeight === "bold");
    italicButton.classList.toggle("active", activeObject.fontStyle === "italic");
    underlineButton.classList.toggle("active", activeObject.underline);

    // Reset transparency to fully opaque when selecting a text
    currentTransparency = 1;
    updateTransparencyDisplay();
  }
});

// Event listener for deselection
canvas.on("selection:cleared", function () {
  const fontFamilySelect = document.getElementById("font-family-select");
  fontFamilySelect.value = "Arial";

  const boldButton = document.getElementById("bold-button");
  const italicButton = document.getElementById("italic-button");
  const underlineButton = document.getElementById("underline-button");

  boldButton.classList.remove("active");
  italicButton.classList.remove("active");
  underlineButton.classList.remove("active");
});

// Transparency functionality
const transparencyValueSpan = document.getElementById("transparency-value");

function updateTransparencyDisplay() {
  const transparencyPercentage = Math.round(currentTransparency * 100);
  transparencyValueSpan.innerText = `${transparencyPercentage}%`;
}

function changeTransparency(value) {
  currentTransparency = value / 100;
  applyTransparency();
  updateTransparencyDisplay();
}

function applyTransparency() {
  const activeObject = canvas.getActiveObject();
  if (activeObject) {
    activeObject.set("opacity", currentTransparency);
    canvas.renderAll();
  }
}

function toggleBold() {
  const activeObject = canvas.getActiveObject();
  if (activeObject && activeObject.type === "i-text") {
    activeObject.set("fontWeight", activeObject.fontWeight === "bold" ? "" : "bold");
    canvas.renderAll();
  }
}

function toggleItalic() {
  const activeObject = canvas.getActiveObject();
  if (activeObject && activeObject.type === "i-text") {
    activeObject.set("fontStyle", activeObject.fontStyle === "italic" ? "" : "italic");
    canvas.renderAll();
  }
}

function toggleUnderline() {
  const activeObject = canvas.getActiveObject();
  if (activeObject && activeObject.type === "i-text") {
    activeObject.set("underline", !activeObject.underline);
    canvas.renderAll();
  }
}

function changeFontFamily() {
  const fontFamily = document.getElementById("font-family-select").value;
  const activeObject = canvas.getActiveObject();
  if (activeObject && activeObject.type === "i-text") {
    activeObject.set("fontFamily", fontFamily);
    canvas.renderAll();
  }
}

const fontFamilySelect = document.getElementById("font-family-select");
fontFamilySelect.addEventListener("change", changeFontFamily);

function changeBackgroundColor() {
  const backgroundColor = document.getElementById("background-color-picker").value;
  canvas.setBackgroundColor(backgroundColor, canvas.renderAll.bind(canvas));
}

// Event listener for background color change
const backgroundColorPicker = document.getElementById("background-color-picker");
backgroundColorPicker.addEventListener("change", changeBackgroundColor);

// Function to set canvas background color
function setCanvasBackgroundColor(color) {
  canvas.setBackgroundColor(color, canvas.renderAll.bind(canvas));
}

// Set initial canvas background color
setCanvasBackgroundColor("#ffffff");


function changeWhiteboardDimensions() {
  const widthInput = document.getElementById("width-input");
  const heightInput = document.getElementById("height-input");
  const width = parseInt(widthInput.value, 10);
  const height = parseInt(heightInput.value, 10);

  if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
    const whiteboardContainer = document.getElementById("whiteboard-container");
    whiteboardContainer.style.width = width + "px";
    whiteboardContainer.style.height = height + "px";
  } else {
    alert("Please enter valid dimensions (positive integers)!");
  }
}




const resizePresets = {
  a4: { width: 595, height: 842 }, // A4 Sheet
  logo: { width: 600, height: 200 }, // Logo
  instagram: { width: 500, height: 500 }, // Instagram Post
  landscape: { width: 770, height: 390 }, // Landscape Banner
  linkedin: { width: 600, height: 600 }, // LinkedIn Post
};

const resizePresetsSelect = document.getElementById("resize-presets");
const applyResizeButton = document.getElementById("apply-resize");

applyResizeButton.addEventListener("click", function () {
  const selectedPreset = resizePresetsSelect.value;
  const dimensions = resizePresets[selectedPreset];
  if (dimensions) {
    changeWhiteboardDimensions(dimensions.width, dimensions.height);
  }
});

function changeWhiteboardDimensions(width, height) {
  const whiteboardContainer = document.getElementById("whiteboard-container");
  whiteboardContainer.style.width = width + "px";
  whiteboardContainer.style.height = height + "px";
  canvas.setDimensions({ width, height });
}




  // Additional shapes
  function drawRectangle(pointer) {
    const rect = new fabric.Rect({
      left: pointer.x - 50,
      top: pointer.y - 25,
      width: 100,
      height: 50,
      fill: currentColor,
      opacity: currentTransparency,
    });

    canvas.add(rect);
  }

  function drawPentagon(pointer) {
    const sideLength = 60; // Adjust the side length as needed
    const centerX = pointer.x;
    const centerY = pointer.y - sideLength / 2;

    const points = [];
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 * i) / 5;
      const x = centerX + sideLength * Math.cos(angle);
      const y = centerY + sideLength * Math.sin(angle);
      points.push({ x, y });
    }

    const pentagon = new fabric.Polygon(points, {
      fill: currentColor,
      opacity: currentTransparency,
    });

    canvas.add(pentagon);
  }

  function drawHexagon(pointer) {
    const sideLength = 60; // Adjust the side length as needed
    const centerX = pointer.x;
    const centerY = pointer.y - sideLength / 2;

    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6;
      const x = centerX + sideLength * Math.cos(angle);
      const y = centerY + sideLength * Math.sin(angle);
      points.push({ x, y });
    }

    const hexagon = new fabric.Polygon(points, {
      fill: currentColor,
      opacity: currentTransparency,
    });

    canvas.add(hexagon);
  }
  

  // Event listener for drawing shapes
  canvas.on("mouse:down", function (options) {
    if (shapeFunctionalityEnabled && currentShape !== "text") {
      const pointer = canvas.getPointer(options.e);

      if (currentShape === "square") {
        drawSquare(pointer);
      } else if (currentShape === "circle") {
        drawCircle(pointer);
      } else if (currentShape === "triangle") {
        drawTriangle(pointer);
      } else if (currentShape === "rectangle") {
        drawRectangle(pointer);
      } else if (currentShape === "pentagon") {
        drawPentagon(pointer);
      } else if (currentShape === "hexagon") {
        drawHexagon(pointer);
      }
      
    }
  });

  
  
  

  // Function to toggle the emoji picker
  function toggleEmojiPicker() {
    const emojiPicker = document.getElementById("emoji-picker");
    emojiPicker.style.display = emojiPicker.style.display === "block" ? "none" : "block";
  }



  // Function to add an emoji to the canvas
  function addEmoji(emoji) {
    const text = new fabric.IText(emoji, {
      left: 50,
      top: 50,
      fill: currentColor,
      fontSize: 30,
    });

    canvas.add(text);
    toggleEmojiPicker(); 
  }



  document.addEventListener("keydown", function (event) {
    // Check if the pressed key is the "Delete" key (keyCode 46)
    if (event.keyCode === 46) {
      // Delete the selected object(s) on the canvas
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        canvas.remove(activeObject);
      }
    }
  });


  function saveAsPdf() {
    const dataURL = canvas.toDataURL({
      format: "pdf",
    });
    downloadFile(dataURL, "whiteboard.pdf");
  }

  //New!!!!
  // Function to save canvas as DOC (Not a standard feature, might require additional libraries)
  function saveAsDoc() {
    // Convert canvas data to DOC format
    // Download the file
  }

  // Function to save canvas as JPEG
  function saveAsJpeg() {
    const dataURL = canvas.toDataURL({
      format: "jpeg",
    });
    downloadFile(dataURL, "whiteboard.jpeg");
  }

  // Function to save canvas as SVG
  function saveAsSvg() {
    const data = canvas.toSVG();
    downloadFile("data:image/svg+xml;charset=utf-8," + encodeURIComponent(data), "whiteboard.svg");
  }

  // Helper function to download the file
  function downloadFile(dataURL, fileName) {
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = fileName;
    link.click();
  }


  // Function to change the text size
  function changeTextSize() {
    const textSizeInput = document.getElementById("text-size-input");
    const newSize = parseInt(textSizeInput.value);
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === "i-text") {
      activeObject.set("fontSize", newSize);
      canvas.renderAll();
    }
  }

  // Function to set the text alignment
  function setTextAlignment(alignment) {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === "i-text") {
      activeObject.set("textAlign", alignment);
      canvas.renderAll();
    }
  }

//New!!!!!!

// Function to handle image upload
function handleImageUpload(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function(event) {
    const dataURL = event.target.result;
    fabric.Image.fromURL(dataURL, function(img) {
      // Set image properties
      img.set({
        left: 50,
        top: 50,
        scaleX: 0.06,
        scaleY: 0.06,
      });
      canvas.add(img);
    });
  };

  if (file) {
    reader.readAsDataURL(file);
  }
}

// Event listener for image upload
const imageUpload = document.getElementById("image-upload");
imageUpload.addEventListener("change", handleImageUpload);













