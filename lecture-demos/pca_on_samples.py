import numpy as np
from sklearn.decomposition import PCA

array = np.load('./samples.npy')


print(array.shape)

pca = PCA(n_components=2)

pca.fit(array)

projection_matrix = pca.components_.T

np.save('./projection.npy', projection_matrix)
