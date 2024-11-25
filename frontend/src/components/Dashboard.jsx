import React, { useState, useEffect } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js";
import { Bar, Pie, Doughnut } from "react-chartjs-2";
import { Container, Card, Row, Col } from "react-bootstrap";
import axios from "axios";

// Registering Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
  const [numericalInsights, setNumericalInsights] = useState({});
  const [monthlySalesData, setMonthlySalesData] = useState(null);
  const [productDistributionData, setProductDistributionData] = useState(null);
  const [genderDistributionData, setGenderDistributionData] = useState(null);
  const [paymentMethodData, setPaymentMethodData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Monthly Sales Data
        const salesResponse = await axios.get("http://localhost:6001/api/monthly-sales");
        console.log("Monthly Sales Data:", salesResponse.data);
        const salesLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const salesData = Array(12).fill(0); // Initialize with 12 months
        let totalSales = 0;
  
        salesResponse.data.forEach((item) => {
          // Ensure total_sales is treated as a number
          const totalSalesValue = parseFloat(item.total_sales) || 0; // Convert to number, or default to 0
          salesData[item.month - 1] = totalSalesValue;
          totalSales += totalSalesValue;
        });
  
        setMonthlySalesData({
          labels: salesLabels,
          datasets: [
            {
              label: "Monthly Sales",
              data: salesData,
              backgroundColor: "rgba(75,192,192,0.6)",
            },
          ],
        });
  
        // Numerical Insights
        const bestMonthIndex = salesData.indexOf(Math.max(...salesData));
        const insights = {
          totalSales: totalSales.toFixed(2), // Now totalSales is a number
          averageSales: (totalSales / 12).toFixed(2),
          bestMonth: salesLabels[bestMonthIndex],
        };
        setNumericalInsights(insights);
  
        // Product Distribution Data
        const productResponse = await axios.get("http://localhost:6001/api/product-sales");
        console.log("Product Sales Data:", productResponse.data);
        setProductDistributionData({
          labels: productResponse.data.map((item) => item.product_line),
          datasets: [
            {
              data: productResponse.data.map((item) => parseFloat(item.total_sales) || 0), // Ensure it's numeric
              backgroundColor: [
                "rgba(255,99,132,0.6)",
                "rgba(54,162,235,0.6)",
                "rgba(255,206,86,0.6)",
                "rgba(75,192,192,0.6)",
                "rgba(153,102,255,0.6)",
              ],
            },
          ],
        });
  
        // Customer Gender Distribution Data
        const genderResponse = await axios.get("http://localhost:6001/api/customer-gender");
        console.log("Gender Distribution Data:", genderResponse.data);
        setGenderDistributionData({
          labels: ["Male", "Female"],
          datasets: [
            {
              data: genderResponse.data.map((item) => item.count),
              backgroundColor: ["rgba(54,162,235,0.6)", "rgba(255,99,132,0.6)"],
            },
          ],
        });
  
        // Payment Method Distribution Data
        const paymentResponse = await axios.get("http://localhost:6001/api/payment-methods");
        console.log("Payment Methods Data:", paymentResponse.data);
        setPaymentMethodData({
          labels: paymentResponse.data.map((item) => item.payment_method),
          datasets: [
            {
              data: paymentResponse.data.map((item) => item.count),
              backgroundColor: [
                "rgba(255,206,86,0.6)",
                "rgba(75,192,192,0.6)",
                "rgba(153,102,255,0.6)",
              ],
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    fetchData();
  }, []);

  return (
    <Container fluid className="mt-4">
      <h1 className="text-center mb-4">Supermarket Dashboard</h1>

      {/* Numerical Insights */}
      {numericalInsights.totalSales && (
        <Row className="mb-4 text-center">
          <Col>
            <Card>
              <Card.Body>
                <Card.Title>Total Sales</Card.Title>
                <Card.Text>${numericalInsights.totalSales}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card>
              <Card.Body>
                <Card.Title>Average Sales</Card.Title>
                <Card.Text>${numericalInsights.averageSales}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card>
              <Card.Body>
                <Card.Title>Best Month</Card.Title>
                <Card.Text>{numericalInsights.bestMonth}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Graphs in 2x2 Grid */}
      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Monthly Sales</Card.Title>
              {monthlySalesData ? <Bar data={monthlySalesData} /> : <p>Loading...</p>}
              <p className="mt-3">
                <strong>SQL command used:</strong>
                <br />
                <code>
                  SELECT MONTH(Transaction_Date) AS month, SUM(Total_Amount) AS total_sales FROM Sales GROUP BY MONTH(Transaction_Date) ORDER BY month;
                </code>
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Product Sales Distribution</Card.Title>
              {productDistributionData ? <Pie data={productDistributionData} /> : <p>Loading...</p>}
              <p className="mt-3">
                <strong>SQL command used:</strong>
                <br />
                <code>
                  SELECT Product_Line AS product_line, SUM(Total_Amount) AS total_sales FROM Sales INNER JOIN Products ON Sales.Product_ID = Products.Product_ID GROUP BY Product_Line;
                </code>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Customer Gender Distribution</Card.Title>
              {genderDistributionData ? <Doughnut data={genderDistributionData} /> : <p>Loading...</p>}
              <p className="mt-3">
                <strong>SQL command used:</strong>
                <br />
                <code>
                  SELECT Gender, COUNT(*) AS count FROM Customers GROUP BY Gender;
                </code>
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Payment Method Distribution</Card.Title>
              {paymentMethodData ? <Bar data={paymentMethodData} /> : <p>Loading...</p>}
              <p className="mt-3">
                <strong>SQL command used:</strong>
                <br />
                <code>
                  SELECT Payment_Method AS payment_method, COUNT(*) AS count FROM Sales GROUP BY Payment_Method;
                </code>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;