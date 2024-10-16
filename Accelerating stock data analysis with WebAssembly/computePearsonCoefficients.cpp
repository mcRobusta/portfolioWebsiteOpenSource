#include <math.h>
#include <chrono> // Uncomment to use example!
//#include <emscripten.h>
#include <iostream> // Uncomment to use example!

using namespace std;

extern "C" {
    //EMSCRIPTEN_KEEPALIVE
    float computePearsonCoefficient(
        float x[], 
        float y[],
        int numberOfValues // How many stock values are there per vector?
        ) {
        float sum_x = 0, sum_y = 0, sum_xy = 0;
        float mean_x = 0, std_x = 0, mean_y = 0, std_y = 0;
        for (int i = 0; i < numberOfValues; i++) {
            sum_x += x[i];
            sum_y += y[i];
            sum_xy += x[i] * y[i];
        }
        mean_x = sum_x / numberOfValues;
        mean_y = sum_y / numberOfValues;
        for (int i = 0; i < numberOfValues; i++) {
            std_x += pow(x[i] - mean_x, 2);
            std_y += pow(y[i] - mean_y, 2);
        }
        std_x = sqrtf(std_x / (numberOfValues-1));
        std_y = sqrtf(std_y / (numberOfValues-1));
        float pearsons_coefficient = sum_xy - (mean_x * mean_y * numberOfValues);
        pearsons_coefficient /= (numberOfValues-1) * std_x * std_y;
        return pearsons_coefficient;
    }
}

/* Example usage: */
int main()
{
    float x[] = {1,2,3,4,5,6,7,8,9,10,11,12,13,14,15};
    float y[] = {1,1/2,1/3,1/4,1/5,1/6,1/7,1/8,1/9,1/10,1/11,1/12,1/13,1/14,1/15};
    const auto start = chrono::system_clock::now();
    float result = computePearsonCoefficient(
        x,
        y,
        15
    );
    const auto end = chrono::system_clock::now();
    cout << "Function returns: " << result << "\nExecution time: ";
    cout << chrono::duration<double, milli>(end - start).count() << "ms \n"; // If using C++20 or later, remove the .count().
} 