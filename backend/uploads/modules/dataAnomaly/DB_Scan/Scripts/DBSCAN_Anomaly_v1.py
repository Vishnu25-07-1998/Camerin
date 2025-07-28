import pandas as pd
from pandas import read_csv
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import DBSCAN
from sqlalchemy import create_engine

# 1. Connect to your database
##@engine = create_engine('sqlite:///example.db')  # Replace with your DB URI (PostgreSQL, MySQL, etc.)

# 2. Load the table into a DataFrame
##@query = "SELECT * FROM your_table_name"
##@df = pd.read_sql(query, engine)
df = read_csv(r"C:\Users\Admin\Downloads\Entities\Fielding_ODI.csv", low_memory=False,dtype=None)

# 3. Select numerical columns for clustering
numerical_cols = df.select_dtypes(include=['float64', 'int64']).columns
data = df[numerical_cols].dropna()  # Drop missing for simplicity

print("DATA",data)

# 4. Normalize the data
scaler = StandardScaler()
X_scaled = scaler.fit_transform(data)

# 5. Run DBSCAN
dbscan = DBSCAN(eps=0.5, min_samples=6)  # Tune eps and min_samples
print("dbscan",dbscan)
labels = dbscan.fit_predict(X_scaled)
print("labels",labels)

# 6. Add anomaly labels back to DataFrame
data['anomaly'] = (labels == -1).astype(int)  # 1 for anomaly, 0 for normal

# 7. (Optional) Join back with original df
result_df = df.copy()
result_df['anomaly'] = data['anomaly']

# 8. View anomalies
anomalies = result_df[result_df['anomaly'] == 1]

# Parameter Tuning Tips
#eps: Neighborhood size. Try values between 0.5 and 3.0

#min_samples: Minimum number of neighbors to form a dense region. Try 5–10

#Use elbow plot or k-distance graph to choose eps
