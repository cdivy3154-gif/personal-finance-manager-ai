/**
 * Smart Expense Categorization Utility
 * Auto-categorizes expenses based on description keywords
 * Rule-based system with keyword matching
 */

const categoryKeywords = {
    Food: [
        'pizza', 'burger', 'restaurant', 'cafe', 'coffee', 'starbucks', 'mcdonalds',
        'subway', 'dominos', 'zomato', 'swiggy', 'food', 'lunch', 'dinner', 'breakfast',
        'snack', 'grocery', 'groceries', 'milk', 'bread', 'chicken', 'rice', 'fruit',
        'vegetable', 'meat', 'fish', 'juice', 'tea', 'canteen', 'mess', 'tiffin',
        'biryani', 'noodles', 'pasta', 'salad', 'ice cream', 'chocolate', 'chips',
        'kfc', 'wendys', 'taco', 'sushi', 'donut', 'bakery', 'dosa', 'idli',
        'pizza hut', 'dunkin', 'panera', 'chipotle'
    ],
    Entertainment: [
        'movie', 'netflix', 'spotify', 'gaming', 'game', 'concert', 'party',
        'club', 'bar', 'pub', 'theatre', 'theater', 'amusement', 'fun', 'outing',
        'hangout', 'streaming', 'disney', 'hulu', 'youtube', 'prime video',
        'playstation', 'xbox', 'steam', 'twitch', 'music', 'event', 'festival',
        'ticket', 'bowling', 'karaoke', 'arcade', 'cinema', 'show'
    ],
    Academics: [
        'book', 'textbook', 'notebook', 'stationery', 'pen', 'pencil', 'tuition',
        'course', 'udemy', 'coursera', 'class', 'lab', 'library', 'print',
        'photocopy', 'xerox', 'assignment', 'project', 'exam', 'fee', 'fees',
        'college', 'university', 'school', 'education', 'study', 'tutorial',
        'calculator', 'laptop', 'software', 'subscription', 'research', 'paper',
        'journal', 'thesis', 'semester'
    ],
    Transportation: [
        'uber', 'lyft', 'ola', 'cab', 'taxi', 'bus', 'train', 'metro',
        'subway', 'fuel', 'gas', 'petrol', 'diesel', 'parking', 'toll',
        'flight', 'airline', 'travel', 'trip', 'ride', 'auto', 'rickshaw',
        'bike', 'scooter', 'car', 'vehicle', 'rapido', 'transport',
        'commute', 'fare', 'pass', 'ticket'
    ],
    Utilities: [
        'electricity', 'electric', 'water', 'wifi', 'internet', 'phone',
        'mobile', 'recharge', 'bill', 'rent', 'maintenance', 'laundry',
        'cleaning', 'repair', 'plumber', 'electrician', 'gas cylinder',
        'prepaid', 'postpaid', 'broadband', 'cable', 'subscription',
        'insurance', 'medical', 'medicine', 'doctor', 'hospital', 'pharmacy',
        'health', 'gym', 'fitness'
    ],
    Shopping: [
        'amazon', 'flipkart', 'myntra', 'clothes', 'clothing', 'shoes',
        'sneakers', 'shirt', 'jeans', 'dress', 'jacket', 'watch', 'bag',
        'backpack', 'wallet', 'sunglasses', 'accessories', 'gadget',
        'headphones', 'earbuds', 'charger', 'case', 'cover', 'decor',
        'furniture', 'bedding', 'pillow', 'towel', 'cosmetics', 'perfume',
        'shampoo', 'soap', 'skincare', 'walmart', 'target', 'mall',
        'shopping', 'purchase', 'online', 'order'
    ]
};

/**
 * Auto-categorize a transaction based on its description
 * @param {string} description - The transaction description
 * @returns {string} - Suggested category
 */
function autoCategorize(description) {
    if (!description) return 'Others';

    const desc = description.toLowerCase().trim();

    // Check each category's keywords
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
        for (const keyword of keywords) {
            if (desc.includes(keyword)) {
                return category;
            }
        }
    }

    return 'Others';
}

/**
 * Get spending insights based on transaction history
 * @param {Array} transactions - Array of transaction objects
 * @returns {Array} - Array of insight strings
 */
function getSpendingInsights(transactions) {
    const insights = [];
    if (!transactions || transactions.length === 0) return insights;

    const now = new Date();
    const thisMonth = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && t.type === 'expense';
    });

    const lastMonth = transactions.filter(t => {
        const d = new Date(t.date);
        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return d.getMonth() === lastMonthDate.getMonth() && d.getFullYear() === lastMonthDate.getFullYear() && t.type === 'expense';
    });

    // Category spending comparison
    const thisMonthByCategory = {};
    const lastMonthByCategory = {};

    thisMonth.forEach(t => {
        thisMonthByCategory[t.category] = (thisMonthByCategory[t.category] || 0) + t.amount;
    });
    lastMonth.forEach(t => {
        lastMonthByCategory[t.category] = (lastMonthByCategory[t.category] || 0) + t.amount;
    });

    // Compare categories month over month
    for (const [cat, amount] of Object.entries(thisMonthByCategory)) {
        const lastAmount = lastMonthByCategory[cat] || 0;
        if (lastAmount > 0) {
            const change = ((amount - lastAmount) / lastAmount * 100).toFixed(0);
            if (change > 20) {
                insights.push(`📈 Your ${cat} expenses increased by ${change}% compared to last month`);
            } else if (change < -20) {
                insights.push(`📉 Great! Your ${cat} expenses decreased by ${Math.abs(change)}% compared to last month`);
            }
        }
    }

    // Weekend vs weekday spending
    const weekendSpending = thisMonth.filter(t => {
        const day = new Date(t.date).getDay();
        return day === 0 || day === 6;
    }).reduce((sum, t) => sum + t.amount, 0);

    const weekdaySpending = thisMonth.filter(t => {
        const day = new Date(t.date).getDay();
        return day !== 0 && day !== 6;
    }).reduce((sum, t) => sum + t.amount, 0);

    if (weekendSpending > 0 && weekdaySpending > 0) {
        // Normalize by number of days
        const weekendDays = 8; // ~8 weekend days per month
        const weekdayDays = 22; // ~22 weekdays
        const weekendAvg = weekendSpending / weekendDays;
        const weekdayAvg = weekdaySpending / weekdayDays;

        if (weekendAvg > weekdayAvg * 1.3) {
            const pct = ((weekendAvg / weekdayAvg - 1) * 100).toFixed(0);
            insights.push(`🎉 You spend ${pct}% more per day on weekends than weekdays`);
        }
    }

    // Highest spending category
    const topCategory = Object.entries(thisMonthByCategory).sort((a, b) => b[1] - a[1])[0];
    if (topCategory) {
        const totalExpense = thisMonth.reduce((s, t) => s + t.amount, 0);
        const pct = ((topCategory[1] / totalExpense) * 100).toFixed(0);
        insights.push(`💡 ${topCategory[0]} is your top expense category at ${pct}% of total spending`);
    }

    // Predicted month-end balance
    const totalIncome = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && t.type === 'income';
    }).reduce((s, t) => s + t.amount, 0);

    const dayOfMonth = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const totalExpenseSoFar = thisMonth.reduce((s, t) => s + t.amount, 0);

    if (dayOfMonth > 5 && totalExpenseSoFar > 0) {
        const projectedExpense = (totalExpenseSoFar / dayOfMonth) * daysInMonth;
        const projectedBalance = totalIncome - projectedExpense;
        insights.push(`🔮 At current pace, your projected month-end balance is $${projectedBalance.toFixed(2)}`);
    }

    return insights;
}

module.exports = { autoCategorize, getSpendingInsights };
