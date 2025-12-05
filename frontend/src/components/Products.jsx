import { useState, useEffect } from "react";
import { getProducts, createProduct, updateProduct, deleteProduct, uploadFile, addToWishlist, removeFromWishlist } from "../services/api";

const API_BASE_URL = "http://localhost:5000";

function Products({ user, onStartChat }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ 
    name: "", 
    description: "", 
    price: "",
    status: "판매중",
    image_url: "",
    video_url: ""
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError("상품을 불러오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const formatNumberWithComma = (value) => {
    const number = value.replace(/[^0-9]/g, '');
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const removeComma = (value) => {
    return value.replace(/,/g, '');
  };

  const handlePriceChange = (e) => {
    const formatted = formatNumberWithComma(e.target.value);
    setFormData({ ...formData, price: formatted });
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const data = await uploadFile(file);
      if (type === 'image') {
        setFormData({ ...formData, image_url: data.url });
      } else {
        setFormData({ ...formData, video_url: data.url });
      }
    } catch (err) {
      setError("파일 업로드에 실패했습니다");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const priceNumber = parseFloat(removeComma(formData.price));
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          ...formData,
          price: priceNumber
        });
      } else {
        await createProduct({
          ...formData,
          price: priceNumber
        });
      }
      setFormData({ name: "", description: "", price: "", status: "판매중", image_url: "", video_url: "" });
      setShowForm(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.error || "상품 저장에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: formatNumberWithComma(product.price.toString()),
      status: product.status,
      image_url: product.image_url || "",
      video_url: product.video_url || ""
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("정말 이 상품을 삭제하시겠습니까?")) return;
    try {
      await deleteProduct(id);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.error || "상품 삭제에 실패했습니다");
    }
  };

  const handleWishlist = async (product) => {
    try {
      if (product.is_wishlisted) {
        await removeFromWishlist(product.id);
      } else {
        await addToWishlist(product.id);
      }
      fetchProducts();
    } catch (err) {
      setError("찜하기 처리에 실패했습니다");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData({ name: "", description: "", price: "", status: "판매중", image_url: "", video_url: "" });
  };

  const formatPrice = (price) => {
    return price.toLocaleString('ko-KR') + '원';
  };

  return (
    <div className="products-section">
      <div className="products-header">
        <h3>📦 상품 목록</h3>
        {!showForm && (
          <button onClick={() => setShowForm(true)}>+ 상품 등록</button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <form className="product-form" onSubmit={handleSubmit}>
          <h4>{editingProduct ? "상품 수정" : "새 상품 등록"}</h4>
          <input
            type="text"
            placeholder="상품명"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <textarea
            placeholder="상품 설명 (선택사항)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <input
            type="text"
            placeholder="가격 (원)"
            value={formData.price}
            onChange={handlePriceChange}
            required
          />
          
          <div className="file-upload-group">
            <label>상품 이미지</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'image')}
              disabled={uploading}
            />
            {formData.image_url && (
              <img src={`${API_BASE_URL}${formData.image_url}`} alt="미리보기" className="preview-image" />
            )}
          </div>

          <div className="file-upload-group">
            <label>상품 영상 (선택사항)</label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => handleFileUpload(e, 'video')}
              disabled={uploading}
            />
            {formData.video_url && (
              <video src={`${API_BASE_URL}${formData.video_url}`} controls className="preview-video" />
            )}
          </div>

          {editingProduct && (
            <div className="status-select">
              <label>판매 상태</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="판매중">판매중</option>
                <option value="판매완료">판매완료</option>
              </select>
            </div>
          )}

          <div className="form-buttons">
            <button type="submit" disabled={loading || uploading}>
              {uploading ? "업로드 중..." : editingProduct ? "수정하기" : "등록하기"}
            </button>
            <button type="button" className="secondary" onClick={handleCancel}>
              취소
            </button>
          </div>
        </form>
      )}

      {loading && !showForm ? (
        <p className="loading">불러오는 중...</p>
      ) : (
        <div className="products-list">
          {products.length === 0 ? (
            <p className="no-products">등록된 상품이 없습니다. 첫 번째 상품을 등록해보세요!</p>
          ) : (
            products.map((product) => (
              <div key={product.id} className="product-card">
                {product.image_url && (
                  <img 
                    src={`${API_BASE_URL}${product.image_url}`} 
                    alt={product.name} 
                    className="product-image"
                  />
                )}
                {product.video_url && (
                  <video 
                    src={`${API_BASE_URL}${product.video_url}`} 
                    controls 
                    className="product-video"
                  />
                )}
                <div className="product-info">
                  <div className="product-title-row">
                    <h4>{product.name}</h4>
                    <span className={`status-badge ${product.status === '판매중' ? 'on-sale' : 'sold-out'}`}>
                      {product.status}
                    </span>
                  </div>
                  <p className="product-description">{product.description}</p>
                  <p className="product-price">{formatPrice(product.price)}</p>
                  <p className="product-meta">판매자: {product.owner}</p>
                </div>
                <div className="product-actions">
                  {user.username !== product.owner && (
                    <>
                      <button onClick={() => onStartChat(product.id)}>💬</button>
                      <button 
                        className={`wishlist-btn ${product.is_wishlisted ? 'wishlisted' : ''}`}
                        onClick={() => handleWishlist(product)}
                      >
                        {product.is_wishlisted ? '❤️' : '🤍'}
                      </button>
                    </>
                  )}
                  {user.username === product.owner && (
                    <>
                      <button className="secondary" onClick={() => handleEdit(product)}>
                        수정
                      </button>
                      <button className="danger" onClick={() => handleDelete(product.id)}>
                        삭제
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Products;
