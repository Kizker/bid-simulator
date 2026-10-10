export interface BiddingItemJson {
  raw_name?: string;
  name?: string;
  title?: string;
  grade?: string;
  status?: string;
  condition?: string;
  stock?: number;
  auction_price?: number;
  startingPrice?: number;
  price?: number;
  price_source?: string;
  imageUrl?: string;
}

export function mapBiddingItemToRoom(item: BiddingItemJson, index: number, now: number) {
  const lotId = `lot-${index + 1}`;
  const rawTitle = item.raw_name || item.name || item.title || `LOT #${String(index + 1).padStart(2, "0")}`;
  const title = rawTitle.toUpperCase();
  const grade = item.grade || "AD";
  const condition = item.condition || "Produk Only";
  const stock = Number(item.stock) || 1;
  const price = Number(item.auction_price || item.startingPrice || item.price) || 1000000;

  const specs = `Unit ${title}, Grade ${grade}, Kondisi ${condition}, Stok ${stock} unit. Status lelang: ${item.status || "Terdaftar"}.`;
  const description = `Unit lelang resmi Bidding Plus grade ${grade}. Kemulusan fisik dan fungsional sesuai standar QC.`;

  // Select clean image based on device name
  let imageUrl = item.imageUrl || "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80";
  if (title.includes("SAMSUNG") || title.includes("GALAXY") || title.includes("FLIP") || title.includes("FOLD")) {
    imageUrl = "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=600&q=80";
  } else if (title.includes("IPHONE") || title.includes("APPLE")) {
    imageUrl = "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80";
  } else if (title.includes("VIVO") || title.includes("OPPO") || title.includes("XIAOMI")) {
    imageUrl = "https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=600&q=80";
  }

  return {
    id: lotId,
    title,
    subtitle: `${condition} • Grade ${grade}`,
    lotBadge: grade,
    condition,
    stock,
    specs,
    description,
    category: "Handphone",
    imageUrl,
    startingPrice: price,
    currentPrice: price,
    bidIncrement: 20000,
    reservePrice: Math.round(price * 1.15),
    status: "ACTIVE" as const,
    totalDurationSeconds: 85920,
    timeRemaining: 85920,
    antiSnipingSeconds: 15,
    highestBidderName: null,
    highestBidderType: null,
    totalBids: 0,
    createdAt: now - index * 1000,
    updatedAt: now - index * 1000,
  };
}
