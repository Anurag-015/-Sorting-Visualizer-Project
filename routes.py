from flask import render_template, request, jsonify
from app import app, db
from models import SortingSession, AlgorithmStats
from sorting_algorithms import (
    bubble_sort, insertion_sort, selection_sort, 
    merge_sort, quick_sort, heap_sort
)
import time
import random

@app.route('/')
def index():
    """Main page with sorting visualizer"""
    return render_template('index.html')

@app.route('/api/generate-array')
def generate_array():
    """Generate a random array for sorting"""
    size = request.args.get('size', 20, type=int)
    min_val = request.args.get('min', 1, type=int)
    max_val = request.args.get('max', 100, type=int)
    
    # Limit array size for performance
    size = min(max(size, 5), 100)
    
    array = [random.randint(min_val, max_val) for _ in range(size)]
    return jsonify({'array': array})

@app.route('/api/sort', methods=['POST'])
def sort_array():
    """Sort an array using specified algorithm"""
    data = request.get_json()
    algorithm = data.get('algorithm')
    array = data.get('array', [])
    step_by_step = data.get('stepByStep', False)
    
    if not array:
        return jsonify({'error': 'No array provided'}), 400
    
    # Algorithm mapping
    algorithms = {
        'bubble': bubble_sort,
        'insertion': insertion_sort,
        'selection': selection_sort,
        'merge': merge_sort,
        'quick': quick_sort,
        'heap': heap_sort
    }
    
    if algorithm not in algorithms:
        return jsonify({'error': 'Invalid algorithm'}), 400
    
    try:
        start_time = time.time()
        result = algorithms[algorithm](array.copy(), step_by_step)
        end_time = time.time()
        
        execution_time = (end_time - start_time) * 1000  # Convert to milliseconds
        
        # Save session to database
        session = SortingSession(
            algorithm=algorithm,
            array_size=len(array),
            comparisons=result.get('comparisons', 0),
            swaps=result.get('swaps', 0),
            execution_time=execution_time,
            mode=data.get('mode', 'learn')
        )
        db.session.add(session)
        db.session.commit()
        
        return jsonify({
            'sorted_array': result['sorted_array'],
            'steps': result.get('steps', []),
            'comparisons': result.get('comparisons', 0),
            'swaps': result.get('swaps', 0),
            'execution_time': execution_time
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/race', methods=['POST'])
def race_algorithms():
    """Race multiple algorithms against each other"""
    data = request.get_json()
    algorithms_to_race = data.get('algorithms', ['bubble', 'insertion', 'selection'])
    array = data.get('array', [])
    
    if not array:
        return jsonify({'error': 'No array provided'}), 400
    
    # Algorithm mapping
    algorithms = {
        'bubble': bubble_sort,
        'insertion': insertion_sort,
        'selection': selection_sort,
        'merge': merge_sort,
        'quick': quick_sort,
        'heap': heap_sort
    }
    
    results = {}
    
    for algo_name in algorithms_to_race:
        if algo_name in algorithms:
            try:
                start_time = time.time()
                result = algorithms[algo_name](array.copy(), True)
                end_time = time.time()
                
                execution_time = (end_time - start_time) * 1000
                
                results[algo_name] = {
                    'steps': result.get('steps', []),
                    'comparisons': result.get('comparisons', 0),
                    'swaps': result.get('swaps', 0),
                    'execution_time': execution_time,
                    'sorted_array': result['sorted_array']
                }
                
                # Save race session
                session = SortingSession(
                    algorithm=algo_name,
                    array_size=len(array),
                    comparisons=result.get('comparisons', 0),
                    swaps=result.get('swaps', 0),
                    execution_time=execution_time,
                    mode='game'
                )
                db.session.add(session)
                
            except Exception as e:
                results[algo_name] = {'error': str(e)}
    
    # Determine winner (fastest execution time)
    winner = None
    fastest_time = float('inf')
    
    for algo_name, result in results.items():
        if 'error' not in result and result['execution_time'] < fastest_time:
            fastest_time = result['execution_time']
            winner = algo_name
    
    if winner:
        # Update winner statistics
        stats = AlgorithmStats.query.filter_by(algorithm=winner).first()
        if stats:
            stats.wins += 1
        else:
            stats = AlgorithmStats(algorithm=winner, wins=1)
            db.session.add(stats)
    
    db.session.commit()
    
    return jsonify({
        'results': results,
        'winner': winner,
        'fastest_time': fastest_time if fastest_time != float('inf') else None
    })

@app.route('/api/algorithm-info/<algorithm>')
def algorithm_info(algorithm):
    """Get detailed information about a specific algorithm"""
    algorithm_data = {
        'bubble': {
            'name': 'Bubble Sort',
            'description': 'Bubble sort is like bubbles rising to the surface! It compares neighboring elements and swaps them if they\'re in the wrong order. The largest elements "bubble up" to the end with each pass through the array. It\'s simple to understand but slow for large datasets.',
            'detailed_explanation': 'Bubble sort works by repeatedly stepping through the list, comparing each pair of adjacent items and swapping them if they are in the wrong order. The pass through the list is repeated until the list is sorted. The algorithm gets its name from the way smaller or larger elements "bubble" to the top of the list.',
            'how_it_works': [
                'Start at the beginning of the array',
                'Compare the first two elements',
                'If they are in the wrong order, swap them',
                'Move to the next pair and repeat',
                'Continue until you reach the end',
                'Repeat the entire process until no swaps are needed'
            ],
            'time_complexity': {
                'best': 'O(n)',
                'average': 'O(n²)',
                'worst': 'O(n²)'
            },
            'space_complexity': 'O(1)',
            'stable': True,
            'adaptive': True,
            'applications': [
                'Teaching basic sorting concepts to beginners',
                'Small datasets (under 50 elements)',
                'Nearly sorted data where few swaps are needed',
                'Situations where simplicity is more important than efficiency'
            ],
            'code': {
                'python': '''def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr''',
                'javascript': '''function bubbleSort(arr) {
    const n = arr.length;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
        }
    }
    return arr;
}'''
            }
        },
        'insertion': {
            'name': 'Insertion Sort',
            'description': 'Insertion sort works like sorting playing cards in your hand. You pick up cards one by one and insert each card into its correct position among the cards you\'ve already sorted. It\'s efficient for small datasets and works great when data is already mostly sorted.',
            'detailed_explanation': 'Insertion sort builds the final sorted array one item at a time. It removes one element from the input data, finds the location it belongs within the sorted list, and inserts it there. It repeats until no input elements remain.',
            'how_it_works': [
                'Start with the second element (assume first is sorted)',
                'Compare it with elements in the sorted portion',
                'Shift larger elements to the right',
                'Insert the current element in its correct position',
                'Move to the next element and repeat',
                'Continue until all elements are processed'
            ],
            'time_complexity': {
                'best': 'O(n)',
                'average': 'O(n²)',
                'worst': 'O(n²)'
            },
            'space_complexity': 'O(1)',
            'stable': True,
            'adaptive': True,
            'applications': [
                'Small datasets (very efficient for arrays with fewer than 50 elements)',
                'Nearly sorted data (performs excellently when data is almost in order)',
                'Online algorithm (can sort data as it arrives)',
                'As a final stage of more complex algorithms like quicksort'
            ],
            'code': {
                'python': '''def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr''',
                'javascript': '''function insertionSort(arr) {
    for (let i = 1; i < arr.length; i++) {
        const key = arr[i];
        let j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
    return arr;
}'''
            }
        },
        'selection': {
            'name': 'Selection Sort',
            'description': 'Selection sort divides the list into sorted and unsorted regions, repeatedly selecting the minimum element from the unsorted region.',
            'time_complexity': {
                'best': 'O(n²)',
                'average': 'O(n²)',
                'worst': 'O(n²)'
            },
            'space_complexity': 'O(1)',
            'stable': False,
            'adaptive': False,
            'applications': [
                'Small datasets',
                'Memory-limited environments',
                'When simplicity is preferred'
            ],
            'code': {
                'python': '''def selection_sort(arr):
    for i in range(len(arr)):
        min_idx = i
        for j in range(i + 1, len(arr)):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr''',
                'javascript': '''function selectionSort(arr) {
    for (let i = 0; i < arr.length; i++) {
        let minIdx = i;
        for (let j = i + 1; j < arr.length; j++) {
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }
    return arr;
}'''
            }
        },
        'merge': {
            'name': 'Merge Sort',
            'description': 'Merge sort uses the "divide and conquer" strategy - like organizing a messy room by dividing it into smaller sections, cleaning each section, then combining them back together. It splits the array in half repeatedly until each piece has just one element, then merges them back in sorted order.',
            'detailed_explanation': 'Merge sort is a divide-and-conquer algorithm that works by dividing the unsorted list into n sublists, each containing one element, then repeatedly merging sublists to produce new sorted sublists until there is only one sublist remaining.',
            'how_it_works': [
                'Divide the array into two halves',
                'Recursively sort both halves',
                'Merge the two sorted halves back together',
                'Continue dividing until each piece has one element',
                'Merge pieces back together in sorted order',
                'Result is a completely sorted array'
            ],
            'time_complexity': {
                'best': 'O(n log n)',
                'average': 'O(n log n)',
                'worst': 'O(n log n)'
            },
            'space_complexity': 'O(n)',
            'stable': True,
            'adaptive': False,
            'applications': [
                'Large datasets where consistent performance is needed',
                'External sorting (when data doesn\'t fit in memory)',
                'When stability is required (keeping equal elements in original order)',
                'Parallel processing (easy to implement across multiple processors)'
            ],
            'code': {
                'python': '''def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    
    result.extend(left[i:])
    result.extend(right[j:])
    return result''',
                'javascript': '''function mergeSort(arr) {
    if (arr.length <= 1) return arr;
    
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));
    
    return merge(left, right);
}

function merge(left, right) {
    const result = [];
    let i = 0, j = 0;
    
    while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) {
            result.push(left[i++]);
        } else {
            result.push(right[j++]);
        }
    }
    
    return result.concat(left.slice(i), right.slice(j));
}'''
            }
        },
        'quick': {
            'name': 'Quick Sort',
            'description': 'Quick sort is like organizing people by height: pick someone as a reference point (pivot), put shorter people on one side and taller people on the other, then repeat for each group. It\'s very fast on average and sorts in-place, making it popular for general-purpose sorting.',
            'detailed_explanation': 'Quicksort is a divide-and-conquer algorithm that works by selecting a \'pivot\' element from the array and partitioning the other elements into two sub-arrays according to whether they are less than or greater than the pivot.',
            'how_it_works': [
                'Choose a pivot element from the array',
                'Partition: rearrange array so elements smaller than pivot come before it',
                'Elements greater than pivot come after it',
                'Recursively apply same process to sub-arrays',
                'Continue until all sub-arrays are sorted',
                'No merging step needed - array is sorted in place'
            ],
            'time_complexity': {
                'best': 'O(n log n)',
                'average': 'O(n log n)',
                'worst': 'O(n²)'
            },
            'space_complexity': 'O(log n)',
            'stable': False,
            'adaptive': False,
            'applications': [
                'General-purpose sorting (most common choice)',
                'Large datasets where average performance matters',
                'In-place sorting when memory is limited',
                'Built into many programming language libraries'
            ],
            'code': {
                'python': '''def quick_sort(arr, low=0, high=None):
    if high is None:
        high = len(arr) - 1
    
    if low < high:
        pi = partition(arr, low, high)
        quick_sort(arr, low, pi - 1)
        quick_sort(arr, pi + 1, high)
    
    return arr

def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    
    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1''',
                'javascript': '''function quickSort(arr, low = 0, high = arr.length - 1) {
    if (low < high) {
        const pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
    return arr;
}

function partition(arr, low, high) {
    const pivot = arr[high];
    let i = low - 1;
    
    for (let j = low; j < high; j++) {
        if (arr[j] <= pivot) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }
    
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    return i + 1;
}'''
            }
        },
        'heap': {
            'name': 'Heap Sort',
            'description': 'Heap sort builds a binary heap from the array and repeatedly extracts the maximum element to build the sorted array.',
            'time_complexity': {
                'best': 'O(n log n)',
                'average': 'O(n log n)',
                'worst': 'O(n log n)'
            },
            'space_complexity': 'O(1)',
            'stable': False,
            'adaptive': False,
            'applications': [
                'Priority queues',
                'When consistent O(n log n) performance is needed',
                'Memory-constrained environments'
            ],
            'code': {
                'python': '''def heap_sort(arr):
    n = len(arr)
    
    # Build max heap
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i)
    
    # Extract elements one by one
    for i in range(n - 1, 0, -1):
        arr[0], arr[i] = arr[i], arr[0]
        heapify(arr, i, 0)
    
    return arr

def heapify(arr, n, i):
    largest = i
    left = 2 * i + 1
    right = 2 * i + 2
    
    if left < n and arr[left] > arr[largest]:
        largest = left
    
    if right < n and arr[right] > arr[largest]:
        largest = right
    
    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]
        heapify(arr, n, largest)''',
                'javascript': '''function heapSort(arr) {
    const n = arr.length;
    
    // Build max heap
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        heapify(arr, n, i);
    }
    
    // Extract elements one by one
    for (let i = n - 1; i > 0; i--) {
        [arr[0], arr[i]] = [arr[i], arr[0]];
        heapify(arr, i, 0);
    }
    
    return arr;
}

function heapify(arr, n, i) {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    
    if (left < n && arr[left] > arr[largest]) {
        largest = left;
    }
    
    if (right < n && arr[right] > arr[largest]) {
        largest = right;
    }
    
    if (largest !== i) {
        [arr[i], arr[largest]] = [arr[largest], arr[i]];
        heapify(arr, n, largest);
    }
}'''
            }
        }
    }
    
    if algorithm in algorithm_data:
        return jsonify(algorithm_data[algorithm])
    else:
        return jsonify({'error': 'Algorithm not found'}), 404

@app.route('/api/stats')
def get_stats():
    """Get overall statistics"""
    total_sessions = SortingSession.query.count()
    algorithm_stats = db.session.query(
        SortingSession.algorithm,
        db.func.count(SortingSession.id).label('runs'),
        db.func.avg(SortingSession.execution_time).label('avg_time'),
        db.func.avg(SortingSession.comparisons).label('avg_comparisons'),
        db.func.avg(SortingSession.swaps).label('avg_swaps')
    ).group_by(SortingSession.algorithm).all()
    
    stats = {
        'total_sessions': total_sessions,
        'algorithms': []
    }
    
    for stat in algorithm_stats:
        stats['algorithms'].append({
            'name': stat.algorithm,
            'runs': stat.runs,
            'avg_time': round(stat.avg_time, 2) if stat.avg_time else 0,
            'avg_comparisons': round(stat.avg_comparisons, 2) if stat.avg_comparisons else 0,
            'avg_swaps': round(stat.avg_swaps, 2) if stat.avg_swaps else 0
        })
    
    return jsonify(stats)
