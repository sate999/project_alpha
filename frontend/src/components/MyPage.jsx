import { useState, useEffect } from "react";
import { getMyProducts, getWishlist } from "../services/api";

const API_BASE_URL = "http://localhost:5000";

function MyPage({ user, onBack }) {
  const [activeTab, setActiveTab] = useState("products");
  const [myProducts, setMyProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "products") {
        const data = await getMyProducts();
        setMyProducts(data);
      } else {
        const data = await getWishlist();
        setWishlist(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return price.toLocaleString('ko-KR') + '원';
  };

  const products = activeTab === "products" ? myProducts : wishlist;

  return (
    <div className="mypage-section">
      <div className="mypage-header">
        <button className="back-btn" onClick={onBack}>← 뒤로</button>
        <h3>👤 마이페이지</h3>
      </div>

      <div className="user-profile">
        <div className="profile-avatar">👤</div>
        <div className="profile-info">
          <h4>{user.username}</h4>
          <p>{user.email}</p>
        </div>
      </div>

      <div className="mypage-tabs">
        <button 
          className={activeTab === "products" ? "active" : ""}
          onClick={() => setActiveTab("products")}
        >
          내 상품 ({myProducts.length})
        </button>
        <button 
          className={activeTab === "wishlist" ? "active" : ""}
          onClick={() => setActiveTab("wishlist")}
        >
          찜 목록 ({wishlist.length})
        </button>
      </div>

      {loading ? (
        <p className="loading">불러오는 중...</p>
      ) : (
        <div className="mypage-products">
          {products.length === 0 ? (
            <p className="no-products">
              {activeTab === "products" ? "등록한 상품이 없습니다." : "찜한 상품이 없습니다."}
            </p>
          ) : (
            products.map((product) => (
              <div key={product.id} className="mypage-product-card">
                {product.image_url && (
                  <img src={`${API_BASE_URL}${product.image_url}`} alt={product.name} />
                )}
                <div className="mypage-product-info">
                  <div className="product-title-row">
                    <h4>{product.name}</h4>
                    <span className={`status-badge ${product.status === '판매중' ? 'on-sale' : 'sold-out'}`}>
                      {product.status}
                    </span>
                  </div>
                  <p className="product-price">{formatPrice(product.price)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default MyPage;
