import cv2

for i in range(0, 50 + 1):
    print(f"img {i}")
    img = cv2.imread(f"fractal ({i}).png")
    img = cv2.resize(img, (500, 500))
    cv2.imwrite(f"downscaled/fractal ({i}) downscaled.png", img)