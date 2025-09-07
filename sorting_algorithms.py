"""
Sorting algorithms with step-by-step tracking for visualization
"""

def bubble_sort(arr, step_by_step=False):
    """
    Bubble Sort implementation with step tracking
    """
    arr = arr.copy()
    steps = []
    comparisons = 0
    swaps = 0
    n = len(arr)
    
    for i in range(n):
        for j in range(0, n - i - 1):
            comparisons += 1
            
            # Track comparison step
            if step_by_step:
                steps.append({
                    'type': 'compare',
                    'indices': [j, j + 1],
                    'values': [arr[j], arr[j + 1]],
                    'array': arr.copy(),
                    'message': f'Comparing {arr[j]} and {arr[j + 1]}'
                })
            
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swaps += 1
                
                # Track swap step
                if step_by_step:
                    steps.append({
                        'type': 'swap',
                        'indices': [j, j + 1],
                        'values': [arr[j], arr[j + 1]],
                        'array': arr.copy(),
                        'message': f'Swapped {arr[j]} and {arr[j + 1]}'
                    })
    
    return {
        'sorted_array': arr,
        'steps': steps,
        'comparisons': comparisons,
        'swaps': swaps
    }

def insertion_sort(arr, step_by_step=False):
    """
    Insertion Sort implementation with step tracking
    """
    arr = arr.copy()
    steps = []
    comparisons = 0
    swaps = 0
    
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        
        if step_by_step:
            steps.append({
                'type': 'select',
                'indices': [i],
                'values': [key],
                'array': arr.copy(),
                'message': f'Selecting element {key} at position {i}'
            })
        
        while j >= 0 and arr[j] > key:
            comparisons += 1
            
            if step_by_step:
                steps.append({
                    'type': 'compare',
                    'indices': [j, j + 1],
                    'values': [arr[j], key],
                    'array': arr.copy(),
                    'message': f'Comparing {arr[j]} > {key}'
                })
            
            arr[j + 1] = arr[j]
            swaps += 1
            j -= 1
            
            if step_by_step:
                steps.append({
                    'type': 'shift',
                    'indices': [j + 1, j + 2],
                    'values': [arr[j + 1], arr[j + 2] if j + 2 < len(arr) else None],
                    'array': arr.copy(),
                    'message': f'Shifting {arr[j + 1]} to the right'
                })
        
        if j >= 0:
            comparisons += 1
        
        arr[j + 1] = key
        
        if step_by_step:
            steps.append({
                'type': 'insert',
                'indices': [j + 1],
                'values': [key],
                'array': arr.copy(),
                'message': f'Inserted {key} at position {j + 1}'
            })
    
    return {
        'sorted_array': arr,
        'steps': steps,
        'comparisons': comparisons,
        'swaps': swaps
    }

def selection_sort(arr, step_by_step=False):
    """
    Selection Sort implementation with step tracking
    """
    arr = arr.copy()
    steps = []
    comparisons = 0
    swaps = 0
    
    for i in range(len(arr)):
        min_idx = i
        
        if step_by_step:
            steps.append({
                'type': 'select_min',
                'indices': [i],
                'values': [arr[i]],
                'array': arr.copy(),
                'message': f'Finding minimum in unsorted portion starting at {i}'
            })
        
        for j in range(i + 1, len(arr)):
            comparisons += 1
            
            if step_by_step:
                steps.append({
                    'type': 'compare',
                    'indices': [j, min_idx],
                    'values': [arr[j], arr[min_idx]],
                    'array': arr.copy(),
                    'message': f'Comparing {arr[j]} with current minimum {arr[min_idx]}'
                })
            
            if arr[j] < arr[min_idx]:
                min_idx = j
                
                if step_by_step:
                    steps.append({
                        'type': 'new_min',
                        'indices': [min_idx],
                        'values': [arr[min_idx]],
                        'array': arr.copy(),
                        'message': f'New minimum found: {arr[min_idx]}'
                    })
        
        if min_idx != i:
            arr[i], arr[min_idx] = arr[min_idx], arr[i]
            swaps += 1
            
            if step_by_step:
                steps.append({
                    'type': 'swap',
                    'indices': [i, min_idx],
                    'values': [arr[i], arr[min_idx]],
                    'array': arr.copy(),
                    'message': f'Swapped {arr[i]} with {arr[min_idx]}'
                })
    
    return {
        'sorted_array': arr,
        'steps': steps,
        'comparisons': comparisons,
        'swaps': swaps
    }

def merge_sort(arr, step_by_step=False):
    """
    Merge Sort implementation with step tracking
    """
    steps = []
    comparisons = [0]  # Use list to allow modification in nested functions
    swaps = [0]
    
    def merge_sort_recursive(arr, left, right, depth=0):
        if left < right:
            mid = (left + right) // 2
            
            if step_by_step:
                steps.append({
                    'type': 'divide',
                    'indices': [left, mid, right],
                    'values': arr[left:right+1],
                    'array': arr.copy(),
                    'message': f'Dividing array from {left} to {right} at {mid}'
                })
            
            merge_sort_recursive(arr, left, mid, depth + 1)
            merge_sort_recursive(arr, mid + 1, right, depth + 1)
            merge(arr, left, mid, right)
    
    def merge(arr, left, mid, right):
        # Create temp arrays
        left_arr = arr[left:mid+1]
        right_arr = arr[mid+1:right+1]
        
        i = j = 0
        k = left
        
        if step_by_step:
            steps.append({
                'type': 'merge_start',
                'indices': [left, mid, right],
                'values': [left_arr, right_arr],
                'array': arr.copy(),
                'message': f'Merging {left_arr} and {right_arr}'
            })
        
        while i < len(left_arr) and j < len(right_arr):
            comparisons[0] += 1
            
            if step_by_step:
                steps.append({
                    'type': 'compare',
                    'indices': [k],
                    'values': [left_arr[i], right_arr[j]],
                    'array': arr.copy(),
                    'message': f'Comparing {left_arr[i]} and {right_arr[j]}'
                })
            
            if left_arr[i] <= right_arr[j]:
                arr[k] = left_arr[i]
                i += 1
            else:
                arr[k] = right_arr[j]
                j += 1
            
            swaps[0] += 1
            k += 1
            
            if step_by_step:
                steps.append({
                    'type': 'place',
                    'indices': [k-1],
                    'values': [arr[k-1]],
                    'array': arr.copy(),
                    'message': f'Placed {arr[k-1]} at position {k-1}'
                })
        
        # Copy remaining elements
        while i < len(left_arr):
            arr[k] = left_arr[i]
            i += 1
            k += 1
            swaps[0] += 1
        
        while j < len(right_arr):
            arr[k] = right_arr[j]
            j += 1
            k += 1
            swaps[0] += 1
    
    arr_copy = arr.copy()
    merge_sort_recursive(arr_copy, 0, len(arr_copy) - 1)
    
    return {
        'sorted_array': arr_copy,
        'steps': steps,
        'comparisons': comparisons[0],
        'swaps': swaps[0]
    }

def quick_sort(arr, step_by_step=False):
    """
    Quick Sort implementation with step tracking
    """
    arr = arr.copy()
    steps = []
    comparisons = [0]
    swaps = [0]
    
    def quick_sort_recursive(arr, low, high):
        if low < high:
            pi = partition(arr, low, high)
            quick_sort_recursive(arr, low, pi - 1)
            quick_sort_recursive(arr, pi + 1, high)
    
    def partition(arr, low, high):
        pivot = arr[high]
        
        if step_by_step:
            steps.append({
                'type': 'pivot',
                'indices': [high],
                'values': [pivot],
                'array': arr.copy(),
                'message': f'Chosen pivot: {pivot} at position {high}'
            })
        
        i = low - 1
        
        for j in range(low, high):
            comparisons[0] += 1
            
            if step_by_step:
                steps.append({
                    'type': 'compare',
                    'indices': [j, high],
                    'values': [arr[j], pivot],
                    'array': arr.copy(),
                    'message': f'Comparing {arr[j]} with pivot {pivot}'
                })
            
            if arr[j] <= pivot:
                i += 1
                if i != j:
                    arr[i], arr[j] = arr[j], arr[i]
                    swaps[0] += 1
                    
                    if step_by_step:
                        steps.append({
                            'type': 'swap',
                            'indices': [i, j],
                            'values': [arr[i], arr[j]],
                            'array': arr.copy(),
                            'message': f'Swapped {arr[i]} and {arr[j]}'
                        })
        
        arr[i + 1], arr[high] = arr[high], arr[i + 1]
        swaps[0] += 1
        
        if step_by_step:
            steps.append({
                'type': 'place_pivot',
                'indices': [i + 1],
                'values': [arr[i + 1]],
                'array': arr.copy(),
                'message': f'Placed pivot {arr[i + 1]} at final position {i + 1}'
            })
        
        return i + 1
    
    quick_sort_recursive(arr, 0, len(arr) - 1)
    
    return {
        'sorted_array': arr,
        'steps': steps,
        'comparisons': comparisons[0],
        'swaps': swaps[0]
    }

def heap_sort(arr, step_by_step=False):
    """
    Heap Sort implementation with step tracking
    """
    arr = arr.copy()
    steps = []
    comparisons = [0]
    swaps = [0]
    n = len(arr)
    
    def heapify(arr, n, i):
        largest = i
        left = 2 * i + 1
        right = 2 * i + 2
        
        if left < n:
            comparisons[0] += 1
            if step_by_step:
                steps.append({
                    'type': 'compare',
                    'indices': [left, largest],
                    'values': [arr[left], arr[largest]],
                    'array': arr.copy(),
                    'message': f'Comparing left child {arr[left]} with {arr[largest]}'
                })
            
            if arr[left] > arr[largest]:
                largest = left
        
        if right < n:
            comparisons[0] += 1
            if step_by_step:
                steps.append({
                    'type': 'compare',
                    'indices': [right, largest],
                    'values': [arr[right], arr[largest]],
                    'array': arr.copy(),
                    'message': f'Comparing right child {arr[right]} with {arr[largest]}'
                })
            
            if arr[right] > arr[largest]:
                largest = right
        
        if largest != i:
            arr[i], arr[largest] = arr[largest], arr[i]
            swaps[0] += 1
            
            if step_by_step:
                steps.append({
                    'type': 'swap',
                    'indices': [i, largest],
                    'values': [arr[i], arr[largest]],
                    'array': arr.copy(),
                    'message': f'Swapped {arr[i]} and {arr[largest]} to maintain heap property'
                })
            
            heapify(arr, n, largest)
    
    # Build max heap
    if step_by_step:
        steps.append({
            'type': 'build_heap',
            'indices': [],
            'values': [],
            'array': arr.copy(),
            'message': 'Building max heap from bottom up'
        })
    
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i)
    
    # Extract elements one by one
    for i in range(n - 1, 0, -1):
        arr[0], arr[i] = arr[i], arr[0]
        swaps[0] += 1
        
        if step_by_step:
            steps.append({
                'type': 'extract',
                'indices': [0, i],
                'values': [arr[0], arr[i]],
                'array': arr.copy(),
                'message': f'Extracted max element {arr[i]} to position {i}'
            })
        
        heapify(arr, i, 0)
    
    return {
        'sorted_array': arr,
        'steps': steps,
        'comparisons': comparisons[0],
        'swaps': swaps[0]
    }
