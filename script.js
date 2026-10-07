(() => {
  const WA_NUMBER = "6282160424092";
  const STORAGE_KEY = "crimsonblock-cart";

  const $ = (id) => document.getElementById(id);
  const drawer = $("cartDrawer");
  const overlay = $("cartOverlay");
  const itemsEl = $("cartItems");
  const countEl = $("cartCount");
  const totalEl = $("cartTotal");
  const checkoutEl = $("cartCheckout");
  const toastEl = $("toast");

  const rupiah = (n) => "Rp " + n.toLocaleString("id-ID");
  const parsePrice = (t) => parseInt(t.replace(/\D/g, ""), 10) || 0;

  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch (e) { cart = []; }

  const save = () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch (e) {}
  };

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toast.t);
    toast.t = setTimeout(() => toastEl.classList.remove("show"), 1800);
  }

  function openCart() {
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    overlay.hidden = false;
  }
  function closeCart() {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    overlay.hidden = true;
  }

  function add(name, price) {
    const found = cart.find((i) => i.name === name);
    if (found) found.qty += 1;
    else cart.push({ name, price, qty: 1 });
    save();
    render();
    toast(name + " masuk troli");
    countEl.classList.remove("bump");
    void countEl.offsetWidth;
    countEl.classList.add("bump");
  }

  function changeQty(name, delta) {
    const item = cart.find((i) => i.name === name);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter((i) => i !== item);
    save();
    render();
  }

  function remove(name) {
    cart = cart.filter((i) => i.name !== name);
    save();
    render();
  }

  function makeBtn(cls, text, label, onClick) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = cls;
    b.textContent = text;
    if (label) b.setAttribute("aria-label", label);
    b.addEventListener("click", onClick);
    return b;
  }

  function render() {
    itemsEl.replaceChildren();
    let total = 0, count = 0;

    cart.forEach((item) => {
      total += item.price * item.qty;
      count += item.qty;

      const li = document.createElement("li");
      li.className = "cart-item";

      const left = document.createElement("div");
      const name = document.createElement("div");
      name.className = "cart-item-name";
      name.textContent = item.name;

      const controls = document.createElement("div");
      controls.className = "cart-item-controls";
      const qty = document.createElement("span");
      qty.className = "qty";
      qty.textContent = item.qty;
      controls.append(
        makeBtn("qty-btn", "−", "Kurangi", () => changeQty(item.name, -1)),
        qty,
        makeBtn("qty-btn", "+", "Tambah", () => changeQty(item.name, 1))
      );
      left.append(name, controls);

      const price = document.createElement("div");
      price.className = "cart-item-price";
      price.textContent = rupiah(item.price * item.qty);

      const rm = makeBtn("cart-remove", "Hapus", "Hapus " + item.name, () => remove(item.name));

      li.append(left, price, document.createElement("span"), rm);
      itemsEl.append(li);
    });

    countEl.textContent = count;
    totalEl.textContent = rupiah(total);
    drawer.classList.toggle("is-empty", cart.length === 0);

    const lines = cart.map((i, n) => `${n + 1}. ${i.name} x${i.qty} — ${rupiah(i.price * i.qty)}`);
    const msg = `Halo Crimson Block, saya mau order:\n${lines.join("\n")}\n\nTotal: ${rupiah(total)}`;
    checkoutEl.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  }

  // tombol "Masukkan ke troli" di tiap kartu
  document.querySelectorAll(".add-cart").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".card");
      const name = card.querySelector(".amount").textContent.trim();
      const price = parsePrice(card.querySelector(".price").textContent);
      add(name, price);
    });
  });

  $("cartOpen").addEventListener("click", openCart);
  $("cartClose").addEventListener("click", closeCart);
  overlay.addEventListener("click", closeCart);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeCart(); });
  $("cartClear").addEventListener("click", () => { cart = []; save(); render(); });

  render();

  // menu hamburger (HP)
  const navToggle = $("navToggle");
  const navLinks = $("navLinks");
  const setNav = (open) => {
    navLinks.classList.toggle("is-open", open);
    navToggle.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", open);
    navToggle.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
  };
  navToggle.addEventListener("click", () => setNav(!navLinks.classList.contains("is-open")));
  navLinks.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setNav(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setNav(false); });
  window.matchMedia("(min-width: 641px)").addEventListener("change", (e) => { if (e.matches) setNav(false); });

  // foto akun: klik untuk memperbesar
  const lb = $("lightbox");
  const lbImg = $("lightboxImg");
  const closeLb = () => { lb.hidden = true; lbImg.removeAttribute("src"); };
  document.querySelectorAll(".card-photo").forEach((p) => {
    p.addEventListener("click", () => {
      const img = p.querySelector("img");
      if (!img) return;
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lb.hidden = false;
    });
  });
  lb.addEventListener("click", closeLb);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLb(); });
})();
