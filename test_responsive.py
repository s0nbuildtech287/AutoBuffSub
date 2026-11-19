import os
import time
from playwright.sync_api import sync_playwright

SCREENSHOT_DIR = r"C:\Users\XUAN SON\.gemini\antigravity\brain\4509d8e3-f43b-4f04-a3a5-6e2a1230caa1\screenshots"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

BREAKPOINTS = [
    {"name": "1920_desktop_large", "width": 1920, "height": 1080},
    {"name": "1440_desktop", "width": 1440, "height": 900},
    {"name": "1366_laptop_popular", "width": 1366, "height": 768},
    {"name": "1280_laptop_small", "width": 1280, "height": 800},
    {"name": "1024_tablet_landscape", "width": 1024, "height": 768},
    {"name": "768_tablet_portrait", "width": 768, "height": 1024},
    {"name": "430_phone_promax", "width": 430, "height": 932},
    {"name": "390_phone_iphone14", "width": 390, "height": 844},
    {"name": "360_phone_android", "width": 360, "height": 780},
    {"name": "320_phone_compact", "width": 320, "height": 650},
]

def run_tests():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        results = []

        for bp in BREAKPOINTS:
            width = bp["width"]
            height = bp["height"]
            name = bp["name"]
            print(f"Testing {name} ({width}x{height})...")

            context = browser.new_context(viewport={"width": width, "height": height})
            page = context.new_page()

            # 1. Test Trang Đặt đơn
            page.goto("http://localhost:3000", wait_until="networkidle")
            page.wait_for_timeout(1000)

            # Check horizontal overflow (scrollWidth vs clientWidth)
            has_h_scroll = page.evaluate("() => document.documentElement.scrollWidth > document.documentElement.clientWidth")
            
            order_img = os.path.join(SCREENSHOT_DIR, f"{width}_{name}_order.png")
            page.screenshot(path=order_img, full_page=False)

            # 2. Test Trang Lịch sử đơn
            # Click History nav item
            history_clicked = False
            try:
                # Try desktop/sidebar nav
                page.evaluate("() => { const btns = Array.from(document.querySelectorAll('button')); const h = btns.find(b => b.textContent && b.textContent.includes('Lịch sử')); if (h) h.click(); }")
                page.wait_for_timeout(600)
                history_clicked = True
            except Exception as e:
                print(f"History click error on {name}: {e}")

            history_img = os.path.join(SCREENSHOT_DIR, f"{width}_{name}_history.png")
            page.screenshot(path=history_img, full_page=False)

            # 3. Test Trang Nạp tiền
            try:
                page.evaluate("() => { const btns = Array.from(document.querySelectorAll('button, div')); const d = btns.find(b => b.textContent && b.textContent.includes('Nạp tiền')); if (d) d.click(); }")
                page.wait_for_timeout(600)
            except Exception as e:
                print(f"Deposit click error on {name}: {e}")

            deposit_img = os.path.join(SCREENSHOT_DIR, f"{width}_{name}_deposit.png")
            page.screenshot(path=deposit_img, full_page=False)

            results.append({
                "name": name,
                "width": width,
                "height": height,
                "h_scroll": has_h_scroll,
                "order_img": order_img,
                "history_img": history_img,
                "deposit_img": deposit_img
            })

            context.close()

        browser.close()

        print("\n=== KẾT QUẢ KIỂM THỬ RESPONSIVE ===")
        for r in results:
            status = "PASS (Không tràn ngang)" if not r["h_scroll"] else "FAIL (Bị tràn ngang)"
            print(f"- {r['width']}px ({r['name']}): {status}")

if __name__ == "__main__":
    run_tests()
