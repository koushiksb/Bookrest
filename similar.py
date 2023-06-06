import pandas as pd
import numpy as np

books = pd.read_csv('./Books.csv')
reviews = pd.read_csv('./Reviews.csv')

average_rating = pd.DataFrame(reviews.groupby('book')['rating'].mean())

average_rating['ratingCount'] = pd.DataFrame(reviews.groupby('book')['rating'].count())
average_rating.sort_values('ratingCount', ascending=False)

counts1 = reviews['user'].value_counts()
ratings = reviews[reviews['user'].isin(counts1[counts1 >= 1000].index)]
counts = reviews['rating'].value_counts()
ratings = reviews[reviews['rating'].isin(counts[counts >= 1000].index)]


ratings.drop_duplicates(subset=['book','user'],inplace=True)
ratings_pivot = ratings.pivot(index='user', columns='book')['rating']
ratings_pivot = ratings_pivot.fillna(0) + np.random.randint(1,10,np.array(ratings_pivot).shape)

def get_similar_book(book_id):
    selected_book = ratings_pivot[book_id]
    similar_book = ratings_pivot.corrwith(selected_book)
    corr_mat = pd.DataFrame(similar_book, columns=['pearsonR'])
    corr_mat.dropna(inplace=True)
    corr_summary = corr_mat.join(average_rating['ratingCount'])
    return corr_summary[corr_summary['ratingCount']>=10].sort_values('pearsonR', ascending=False).head().index.to_list()    


reviews.drop(columns = [reviews.columns[0],reviews.columns[1],reviews.columns[-1]],inplace=True)		
average_rating = pd.DataFrame(reviews.groupby('user')['rating'].mean())
average_rating['ratingCount'] = pd.DataFrame(reviews.groupby('user')['rating'].count())
average_rating.sort_values('ratingCount', ascending=False)

counts1 = reviews['user'].value_counts()
ratings = reviews[reviews['user'].isin(counts1[counts1 >= 1000].index)]
counts = reviews['rating'].value_counts()
ratings = reviews[reviews['rating'].isin(counts[counts >= 1000].index)]

ratings.drop_duplicates(subset=['book','user'],inplace=True)

ratings_pivot = ratings.pivot(index='book', columns='user')['rating']
ratings_pivot = ratings_pivot.fillna(0) + np.random.randint(1,10,np.array(ratings_pivot).shape)

def similar_user(user_id):
  selected_user = ratings_pivot[user_id]
  similar_user = ratings_pivot.corrwith(selected_user)
  corr_mat = pd.DataFrame(similar_user, columns=['pearsonR'])
  corr_mat.dropna(inplace=True)
  corr_summary = corr_mat.join(average_rating['ratingCount'])
  return corr_summary[corr_summary['ratingCount']>=10].sort_values('pearsonR', ascending=False).head(15).index.to_list()[1:]
  