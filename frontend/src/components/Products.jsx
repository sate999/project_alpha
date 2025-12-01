import { useState, useEffect } from "react";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../services/api";

function Products({ user }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "", price: "" });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          ...formData,
          price: parseFloat(formData.price)
        });
      } else {
        await createProduct({
          ...formData,
          price: parseFloat(formData.price)
        });
      }
      setFormData({ name: "", description: "", price: "" });
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
      price: product.price.toString()
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

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData({ name: "", description: "", price: "" });
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
            type="number"
            step="100"
            placeholder="가격 (원)"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
          />
          <div className="form-buttons">
            <button type="submit" disabled={loading}>
              {editingProduct ? "수정하기" : "등록하기"}
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
                <div className="product-info">
                  <h4>{product.name}</h4>
                  <p className="product-description">{product.description}</p>
                  <p className="product-price">{formatPrice(product.price)}</p>
                  <p className="product-meta">판매자: {product.owner}</p>
                </div>
                {user.username === product.owner && (
                  <div className="product-actions">
                    <button className="secondary" onClick={() => handleEdit(product)}>
                      수정
                    </button>
                    <button className="danger" onClick={() => handleDelete(product.id)}>
                      삭제
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Products;
