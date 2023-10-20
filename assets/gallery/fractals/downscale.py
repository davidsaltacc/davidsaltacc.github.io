import cv2

for i in range(0, 47 + 1):
    print(f"image {i}")
    img = cv2.imread(f"fractal ({i}).png")
    img = cv2.resize(img, (400, 400))
    cv2.imwrite(f"downscaled/fractal ({i}) downscaled.png", img)