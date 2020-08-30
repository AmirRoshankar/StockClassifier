import numpy
import sys
import os
from datetime import date
import matplotlib.pyplot as plt
from operator import itemgetter

# Finds the difference between two stocks' histories
def diffCalc(g1, g2):
    diff = 0
    minLength = min(len(g1),len(g2))
    if minLength ==0:
        print ( "DIVISION BY 0 ERROR")
    for ele in range(minLength):
        diff+= (g2[len(g2)-1-ele][1] - g1[len(g1)-1-ele][1])**2

    diff = diff**(1/2)
    return diff

# Adds two stock histories
def sumCalc(g1, g2):
    sum = []
    minLength = min(len(g1),len(g2))
    for ele in range(minLength):
        sum.append([g1[len(g1)-1-ele][0] ,(g2[len(g2)-1-ele][1] + g1[len(g1)-1-ele][1])])
    return sum

# Initializes the first K centroids to the first K data points
def initCentroids(data, K):
    centroids = []
    for k,key in enumerate(data):
        if k >=K:
            break
        centroids.append(data[key])
        dataSet = data[key]
        plt.plot(*zip(*dataSet), 'g')
        plt.show()
    return centroids

# Find which data points are closest to which newCentroids
# Returns list of lists, the inner lists are a list of stock data points
# The index of the outer lists correspond to the centroid that is closest to that group of data
def findCentroidGroups(data, centroids, K):
    groupSets = [[] for c in centroids]
    for d in data.keys():
        curDat = data[d]
        minD = 0
        minCIdx = -1
        for c in range(len(centroids)):
            #print("curDist detaisl")
            #print("centroids " + str(centroids[c][1:10]))
            #print("curDat " + str(curDat[1:10]))
            curD = diffCalc(centroids[c], curDat)
            #print(str(curD) + " " + str(minD))
            if minCIdx ==-1 or curD<minD:
                minD = curD
                minCIdx = c
        groupSets[minCIdx].append([d, curDat])
    return groupSets

# calculate the average cost of the current centroids and data sets
def calcCost (groupSets, centroids, K):
    aveDiff = 0
    for k in range(K):
        curGroup = groupSets[k]
        curAveDiff = 0
        for d in curGroup:
            curAveDiff += diffCalc(centroids[k], d[1])
        aveDiff += curAveDiff/len(curGroup)
    aveDiff /= K
    return aveDiff

# find the next centroids by averaging the grouped data sets
def calcNextCentroids(dataGrouped, K):
    newCentroids = []
    for g in dataGrouped:
        aveCent = []
        for d, curDat in g:
            if aveCent==[]:
                aveCent = curDat
            else:
                aveCent = sumCalc(aveCent, curDat)
        numDinG = len(g)
        aveCent = [[x, y/numDinG] for [x,y] in aveCent]
        newCentroids.append(aveCent)
    return newCentroids

# Performs the K-means clustering algo
def KMeanCluster(data, minK, maxK, numRounds):
    if len(data) < maxK :
        print("not enough data ")
        return
    for k in range (minK, maxK+1):
        centroids = []
        centroids = initCentroids(data, k)
        groupedData = None
        for r in range(numRounds):
            groupedData = findCentroidGroups(data, centroids, k)
            centroids = calcNextCentroids(groupedData, k)
        print("Showing centroids for K = " + str(k))
        print("cost " + str(calcCost(groupedData, centroids, k)))
        for centroid in centroids:
            plt.plot(*zip(*centroid))
            plt.show()

# read in all txt files in the dir directory
# Stores them in a hashmap with the file name as the key and the data as the value
#The data is a list of lists
# Each nested list had 2 values, the date (in days) and the ave price (average of the high and low that day)
def readFiles(dir):
    dict = {}
    originDay = date(1,1,1)
    for fileName in os.listdir(dir):
        inFile = open(dir+"\\"+fileName, "r")
        curFileData =[]
        allLines = inFile.readlines()
        if len(allLines)<366*12:
            continue
        for line in allLines:
            if line[0] != "D":
                line = line[:len(line)-1]
                split = line.split(",")
                dateSplit = split[0].split("-")
                curDate = date(int(dateSplit[0]), int(dateSplit[1]), int(dateSplit[2]))
                curDay = (curDate-originDay).days
                reformedSplit = [curDay, (float(split[2]) + float(split[3]))/2]
                # for i in range(1,len(split)):
                #     reformedSplit.append(float(split[i]))
                curFileData.append(reformedSplit)
        maxPrice = max(curFileData, key = itemgetter(1))[1]
        print(maxPrice)
        for i in range(len(curFileData)):
            curFileData[i] = [curFileData[i][0], curFileData[i][1]/maxPrice]
        #plt.plot(*zip(*curFileData))
        #plt.show()
        #print(curFileData)
        dict[fileName] = curFileData
    return dict

if __name__ == "__main__":
    dir = sys.argv[1]
    data = readFiles(dir)
    KMeanCluster(data, 2, 5, 15)
    #for d in data.keys():
        #print(data[d])
    # for dSet in data.keys():
    #     datSet1 = data[dSet]
    #     zip(*datSet1)
    #     plt.plot(*zip(*datSet1))
    #     plt.show()
