document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const takePhotoBtn = document.getElementById('takePhoto');
    const pickFromGalleryBtn = document.getElementById('pickFromGallery');
    const checkPermissionsBtn = document.getElementById('checkPermissions');
    const capturedImage = document.getElementById('capturedImage');
    const permissionText = document.getElementById('permissionText');
    const qualityRadios = document.querySelectorAll('input[name="quality"]');

    // Initialize Capacitor
    const { Camera, Permissions } = Capacitor.Plugins;

    // Check permissions on load
    checkCameraPermissions();

    // Event Listeners
    takePhotoBtn.addEventListener('click', takePhoto);
    pickFromGalleryBtn.addEventListener('click', pickFromGallery);
    checkPermissionsBtn.addEventListener('click', checkCameraPermissions);

    // Get selected quality
    function getSelectedQuality() {
        for (const radio of qualityRadios) {
            if (radio.checked) {
                return parseInt(radio.value);
            }
        }
        return 100;
    }

    // Check camera permissions
    async function checkCameraPermissions() {
        try {
            if (!Permissions) {
                permissionText.textContent = "Permissions API not available in browser";
                permissionText.style.color = "#f5576c";
                return;
            }

            const permission = await Permissions.query({
                name: 'camera'
            });

            let statusText = `Camera Permission: ${permission.state}`;
            permissionText.textContent = statusText;

            switch (permission.state) {
                case 'granted':
                    permissionText.style.color = "#4CAF50";
                    break;
                case 'denied':
                    permissionText.style.color = "#f5576c";
                    break;
                case 'prompt':
                    permissionText.style.color = "#FF9800";
                    break;
                default:
                    permissionText.style.color = "#666";
            }
        } catch (error) {
            console.error('Permission check error:', error);
            permissionText.textContent = `Error: ${error.message}`;
            permissionText.style.color = "#f5576c";
        }
    }

    // Take a photo
    async function takePhoto() {
        try {
            if (!Camera) {
                alert('Camera plugin not available in browser. Run on Android device.');
                return;
            }

            const image = await Camera.getPhoto({
                quality: getSelectedQuality(),
                allowEditing: true,
                resultType: 'dataUrl',
                saveToGallery: true,
                promptLabelHeader: 'Photo Options',
                promptLabelPhoto: 'Take Photo',
                promptLabelPicture: 'Choose from Gallery',
                promptLabelCancel: 'Cancel'
            });

            displayImage(image.dataUrl);
            showNotification('Photo captured successfully!');
            
        } catch (error) {
            console.error('Error taking photo:', error);
            
            if (error.message.includes('permission')) {
                alert('Camera permission is required. Please grant permission in app settings.');
            } else if (error.message !== 'User cancelled photos app') {
                alert(`Error: ${error.message}`);
            }
        }
    }

    // Pick image from gallery
    async function pickFromGallery() {
        try {
            if (!Camera) {
                alert('Camera plugin not available in browser. Run on Android device.');
                return;
            }

            const image = await Camera.pickImages({
                quality: getSelectedQuality(),
                limit: 1
            });

            if (image.photos && image.photos.length > 0) {
                // Note: For Capacitor 5+, you might need to use Capacitor.convertFileSrc()
                // For simplicity, we'll show a message
                alert('Image selected from gallery! In a real app, you would process the image here.');
                // displayImage(image.photos[0].webPath);
            }
            
        } catch (error) {
            console.error('Error picking from gallery:', error);
            if (error.message !== 'User cancelled photos app') {
                alert(`Error: ${error.message}`);
            }
        }
    }

    // Display captured image
    function displayImage(imageDataUrl) {
        capturedImage.src = imageDataUrl;
        capturedImage.style.display = 'block';
        
        // Add animation
        capturedImage.style.animation = 'none';
        setTimeout(() => {
            capturedImage.style.animation = 'fadeIn 0.5s ease-in';
        }, 10);
    }

    // Show notification
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
});
