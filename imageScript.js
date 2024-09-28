document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});

document.getElementById('imageModal').addEventListener('click', function (event) {
    if (event.target === this) {
        closeModal();
    }
});

function createImageGroups(imageArray) {
    const content = document.getElementById('content');
    content.innerHTML = ''; // Clear existing content

    const groupedImages = imageArray.reduce((acc, image) => {
        acc[image.group] = acc[image.group] || [];
        acc[image.group].push(image);
        return acc;
    }, {});

    for (const groupName in groupedImages) {
        const groupContainer = document.createElement('section');
        groupContainer.className = 'group';

        const groupTitle = document.createElement('h2');
        groupTitle.className = 'group-title';
        groupTitle.textContent = groupName;
        groupContainer.appendChild(groupTitle);

        const gallery = document.createElement('div');
        gallery.className = 'gallery';

        groupedImages[groupName].forEach(image => {
            const card = document.createElement('div');
            card.className = 'image-card';
            card.onclick = () => openModal(image.src);

            const img = document.createElement('img');
            img.src = image.src;
            img.alt = image.description;

            const description = document.createElement('div');
            description.textContent = image.description;
            description.className = 'description';

            card.appendChild(img);
            card.appendChild(description);
            gallery.appendChild(card);
        });

        groupContainer.appendChild(gallery);
        content.appendChild(groupContainer);
    }
}

let scale = 1, lastPanX = 0, lastPanY = 0;
let initialDistance = 0, initialScale = 1;

function openModal(imageSrc) {
    const modalImage = document.getElementById('modalImage');
    modalImage.src = imageSrc;
    document.getElementById('imageModal').style.display = 'flex';

    let isPanning = false;
    let startX = 0, startY = 0;

    modalImage.style.left = '50%';
    modalImage.style.top = '50%';
    modalImage.style.transform = `translate(-50%, -50%) scale(${scale})`; // Reset scale

    modalImage.onmousedown = (e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        isPanning = true;
        startX = e.clientX - lastPanX;
        startY = e.clientY - lastPanY;
        modalImage.style.cursor = 'grabbing';
    };

    modalImage.onmousemove = (e) => {
        if (!isPanning) return;
        lastPanX = e.clientX - startX;
        lastPanY = e.clientY - startY;
        modalImage.style.transform = `translate(${lastPanX}px, ${lastPanY}px) scale(${scale})`;
    };

    modalImage.onmouseup = modalImage.onmouseleave = () => {
        isPanning = false;
        modalImage.style.cursor = 'grab';
    };

    modalImage.ontouchstart = (e) => {
        if (e.touches.length === 1) {
            e.preventDefault();
            isPanning = true;
            startX = e.touches[0].clientX - lastPanX;
            startY = e.touches[0].clientY - lastPanY;
        } else if (e.touches.length === 2) {
            e.preventDefault();
            isPanning = false;
            initialDistance = getDistance(e.touches[0], e.touches[1]);
            initialScale = scale;

            const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

            const modalRect = modalImage.getBoundingClientRect();
            const originX = ((centerX - modalRect.left) / modalRect.width) * 100;
            const originY = ((centerY - modalRect.top) / modalRect.height) * 100;

            modalImage.style.transformOrigin = `${originX}% ${originY}%`;
        }
    };

    modalImage.ontouchmove = (e) => {
        if (e.touches.length === 1 && isPanning) {
            lastPanX = e.touches[0].clientX - startX;
            lastPanY = e.touches[0].clientY - startY;
            modalImage.style.transform = `translate(${lastPanX}px, ${lastPanY}px) scale(${scale})`;
        } else if (e.touches.length === 2) {
            e.preventDefault();
            const newDistance = getDistance(e.touches[0], e.touches[1]);
            scale = initialScale * (newDistance / initialDistance);
            scale = Math.max(1, Math.min(scale, 5)); // Set zoom limits
            modalImage.style.transform = `translate(${lastPanX}px, ${lastPanY}px) scale(${scale})`;
        }
    };

    modalImage.ontouchend = () => {
        isPanning = false;
    };
}

function getDistance(touch1, touch2) {
    return Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
    );
}

function closeModal() {
    const modalImage = document.getElementById('modalImage');
    document.getElementById('imageModal').style.display = 'none';
    lastPanX = lastPanY = 0; // Reset pan offset
    scale = 1; // Reset zoom
    modalImage.style.transform = `translate(-50%, -50%) scale(${scale})`;
    modalImage.style.transformOrigin = 'center center';
}


createImageGroups(images);