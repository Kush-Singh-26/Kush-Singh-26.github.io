---
title: "ant"
date: "2026-02-07"
description: "maths ant note"
tags: ["ant"]
pinned: false
---

ANT SELF NOTES (Corrected)
==========================

Root Finding for Non-Linear Equations
-------------------------------------

### I. Iterative Methods (Based on 1st Degree Equations)

*   **Concept:** Approximate the curve of a function with a straight line to predict where the root lies.

#### 1\. Newton-Raphson Method

*   **Mechanism:** Uses a tangent line to approximate the root.
*   **Requirement:** The function must be differentiable.

**Formula:**

$$
x_{n+1}=x_{n}-\frac{f\left(x_{n}\right)}{f^{′}\left(x_{n}\right)}
$$

*    $x_{n}$ : Current guess.
*    $x_{n+1}$ : Next approximation.

**Convergence:**

$$
Order=2\left(Quadratic\right)
$$

> **Example 1:**  $f\left(x\right)=x^{2}-4$ , Initial guess  $x_{0}=6$ 
> 
> *    $f^{′}\left(x\right)=2x$ 
> *   Iteration:  $x_{n+1}=x_{n}-\frac{x_{n2}-4}{2x_{n}}$ 
> *    $x_{1}=3.333\to x_{2}=2.266\to x_{3}=2.01\to x_{4}=2.00$ 
>     

> **Example 2 (Inverse):** Approximate  $\frac{1}{19}$ 
> 
> *   Let  $x=\frac{1}{19}\Rightarrow \frac{1}{x}-19=0$ 
> *    $f\left(x\right)=\frac{1}{x}-19\Rightarrow f^{′}\left(x\right)=-\frac{1}{x^{2}}$ 
> *   Iteration:  $x_{n+1}=x_{n}+x_{n2}\left(\frac{1}{x_{n}}-19\right)=x_{n}\left(2-19x_{n}\right)$ 
> *    $x_{0}=0.05\Rightarrow x_{1}=0.0525\dots$ 
>     

* * *

#### 2\. Secant Method

*   **Mechanism:** Uses a secant line passing through 2 previous approximations.
*   **Advantage:** Useful when  $f^{′}\left(x\right)$  is difficult to compute.

**Formula:**

$$
x_{n+1}=x_{n}-f\left(x_{n}\right)\cdot \frac{x_{n}-x_{n-1}}{f\left(x_{n}\right)-f\left(x_{n-1}\right)}
$$

*   Requires 2 initial guesses:  $x_{n}$  and  $x_{n-1}$ .

**Convergence:**

$$
Order\approx 1.618\left(Super-linear\right)
$$

> **Example:**  $f\left(x\right)=xe^{x}-1=0$ 
> 
> *    $x_{0}=0.3,x_{1}=0.6$ 
> *    $x_{2}=0.5593\to x_{3}=0.56693\to x_{4}=0.56714$ 
>     

* * *

### II. Based on  $2^{nd}$  Degree Polynomials

#### 1\. Muller's Method

*   **Concept:** Approximates the function using a parabola (quadratic interpolation) through 3 points ( $x_{k},x_{k-1},x_{k-2}$ ).

**Parameters:**

*   **Denominator:**  $D=\left(x_{k}-x_{k-1}\right)\left(x_{k}-x_{k-2}\right)\left(x_{k-1}-x_{k-2}\right)$ 
*   **Coefficients:**
    *    $a_{2}=f\left(x_{k}\right)$ 
    *    $a_{1}=\frac{1}{D}\left[\left(x_{k}-x_{k-2}\right)^{2}\left(f\left(x_{k}\right)-f\left(x_{k-1}\right)\right)-\left(x_{k}-x_{k-1}\right)^{2}\left(f\left(x_{k}\right)-f\left(x_{k-2}\right)\right)\right]$ 
    *    $a_{0}=\frac{1}{D}\left[\left(x_{k}-x_{k-2}\right)\left(f\left(x_{k}\right)-f\left(x_{k-1}\right)\right)-\left(x_{k}-x_{k-1}\right)\left(f\left(x_{k}\right)-f\left(x_{k-2}\right)\right)\right]$ 

**Iteration Formula (Corrected):**

$$
x_{k+1}=x_{k}-\frac{2a_{2}}{a_{1}\pm \sqrt{a_{12}-4a_{0}a_{2}}}
$$

*   **Note:** Choose the sign ( $\pm$ ) that matches the sign of  $a_{1}$  to maximize the denominator (minimize the step size).

**Convergence:**

$$
Order\approx 1.84
$$

> **Example:**  $f\left(x\right)=x^{3}-13x-12$ 
> 
> *    $x_{0}=4.5,x_{1}=5.5,x_{2}=5$ 
> *   Result:  $x_{3}=3.9765$ 
>     

* * *

#### 2\. Chebyshev Method

*   **Mechanism:** Uses second derivative information for higher precision.

**Formula:**

$$
x_{n+1}=x_{n}-\frac{f\left(x_{n}\right)}{f^{′}\left(x_{n}\right)}-\frac{1}{2}\cdot \frac{f^{′′}\left(x_{n}\right)\cdot \left[f\left(x_{n}\right)\right]^{2}}{\left[f^{′}\left(x_{n}\right)\right]^{3}}
$$

**Convergence:**

$$
Order=3\left(Cubic\right)
$$

* * *

Systems of Non-Linear Equations
-------------------------------

### Newton-Raphson for Systems

*   **Concept:** Find a vector of roots  $x$  for a vector function  $F\left(x\right)$ .

**Formula:**

$$
X_{new}=X_{old}-J^{-1}F\left(X_{old}\right)
$$

**Jacobian Matrix  $J\left(x,y\right)$ :**

$$
J=\left[\frac{\partial f_{1}}{\partial x}\frac{\partial f_{2}}{\partial x}​\frac{\partial f_{1}}{\partial y}\frac{\partial f_{2}}{\partial y}​\right]
$$

> **Example:**
> 
> *    $f_{1}=x^{2}+y^{2}-5$ 
> *    $f_{2}=x^{2}-y^{2}-3$ 
> *   Initial guess:  $\left(1.5,1.5\right)$ 
> *   Result:  $X_{1}=\left[2.0833,1.0834\right]^{T}$ 
>     

* * *

Interpolation
-------------

### Unequal Intervals (General Purpose)

*   **Concept:** Works regardless of whether spacing between data points is uniform or random.

#### 1\. Lagrange Interpolation

**Formula:**

$$
P\left(x\right)=L_{0}\left(x\right)y_{0}+L_{1}\left(x\right)y_{1}+\cdots +L_{n}\left(x\right)y_{n}
$$

**Basis Polynomial:**

$$
L_{i}\left(x\right)=\frac{\prod_{j\ne i} \left(x-x_{j}\right)}{\prod_{j\ne i} \left(x_{i}-x_{j}\right)}
$$

*   **Intuition:**  $L_{i}\left(x\right)$  acts as a "switch": it is  $1$  at  $x_{i}$  and  $0$  at all other nodes.

#### 2\. Newton's Divided Difference

*   **Advantage:** Better for dynamic data. If a new point is added, you just add a new term/row rather than recalculating the whole polynomial.
*   **Structure:** Builds the polynomial term by term.

* * *

### Fundamental Operators

| Operator | Symbol | Formula |
| --- | --- | --- |
| **Forward** | $\Delta$ | $\Delta f\left(x\right)=f\left(x+h\right)-f\left(x\right)$ |
| **Backward** | $\nabla$ | $\nabla f\left(x\right)=f\left(x\right)-f\left(x-h\right)$ |
| **Central** | $\delta$ | $\delta f\left(x\right)=f\left(x+\frac{h}{2}\right)-f\left(x-\frac{h}{2}\right)$ |
| **Shifting** | $E$ | $Ef\left(x\right)=f\left(x+h\right)$ |
| **Averaging** | $\mu$ | $\mu f\left(x\right)=\frac{1}{2}\left[f\left(x+\frac{h}{2}\right)+f\left(x-\frac{h}{2}\right)\right]$ |

* * *

### Advanced Interpolation

#### 1\. Hermite Interpolation

*   **Input:** Matches **function values** ( $y$ ) AND **first derivatives** ( $y^{′}$ ) at every point.
*   **Outcome:** Ensures the curve flows smoothly with the correct direction (slope) at data points.

#### 2\. Bivariate Interpolation (Gregory-Newton)

*   **Concept:** Interpolation for functions of two variables  $z=f\left(x,y\right)$ .

**Mixed Difference Operator:**

$$
\Delta _{xy}f\left(x,y\right)=f\left(x+h,y+k\right)-f\left(x,y+k\right)-f\left(x+h,y\right)+f\left(x,y\right)
$$

## Prompt:
now how to remember these formulas. Help me learn them. show patterns, tips to easily remember them

## Response:
Memorizing numerical method formulas can be daunting if you try to rote learn them character by character. The secret is to **memorize the geometry/concept** and let the formula follow from that.

Here is a breakdown of the patterns and "memory hacks" to make these stick.

### 1\. Newton-Raphson: "The Slide"

**The Hack:** Don't memorize the fraction. Visualize the tangent line.

*   **Concept:** You are at a point  $\left(x_{n},f\left(x_{n}\right)\right)$ . You slide down the tangent line (slope  $f^{′}\left(x_{n}\right)$ ) until you hit the x-axis (where  $y=0$ ).
*   **The Math:**
    $$
    Slope=\frac{Rise}{Run}\Rightarrow f^{′}\left(x_{n}\right)=\frac{0-f\left(x_{n}\right)}{x_{n+1}-x_{n}}
    $$
    Rearrange that, and you get the formula:
    $$
    x_{n+1}=x_{n}-\frac{f\left(x_{n}\right)}{f^{′}\left(x_{n}\right)}
    $$
*   **Mnemonic:** "New is Old minus Function over Slope."

* * *

### 2\. Secant Method: "Newton's Cousin"

**The Hack:** The Secant method is just Newton-Raphson, but for people who hate derivatives.

*   **Pattern:** In Newton's formula, you have  $f^{′}\left(x_{n}\right)$ .
*   In Secant, we just approximate  $f^{′}\left(x_{n}\right)$  using the "Slope Formula" (Rise/Run) between the last two points:
    $$
    f^{′}\left(x_{n}\right)\approx \frac{f\left(x_{n}\right)-f\left(x_{n-1}\right)}{x_{n}-x_{n-1}}
    $$
*   **Substitution:** Take Newton's formula and swap  $f^{′}\left(x\right)$  with that fraction.
    $$
    x_{n+1}=x_{n}-\frac{f\left(x_{n}\right)}{\left[\frac{f\left(x_{n}\right)-f\left(x_{n-1}\right)}{x_{n}-x_{n-1}}\right]}
    $$
    Flip the denominator, and you have the Secant formula!

* * *

### 3\. Muller's Method: "The Quadratic Disguise"

**The Hack:** This looks terrifying, but it is actually just the **Quadratic Formula** upside down.

*   Standard Quadratic Formula:  $x=\frac{-b\pm \sqrt{b^{2}-4ac}}{2a}$ 
*   Muller's Formula:
    $$
    x_{new}=x_{old}-\frac{2c}{b\pm \sqrt{b^{2}-4ac}}
    $$
    _(Note: In Muller's notation,  $a_{2}$  is like  $c$ ,  $a_{1}$  is like  $b$ , and  $a_{0}$  is like  $a$ . It solves for  $x$  close to 0)._

**Visualizing the variables:** Think of the coefficients as "Recent history":

*    $a_{2}=f\left(x_{k}\right)$  (Current height)
*    $a_{1}\approx$  Slope (First difference)
*    $a_{0}\approx$  Curvature (Second difference)

* * *

### 4\. Chebyshev Method: "The Taylor Expansion"

**The Hack:** It’s Newton-Raphson plus a "correction term".

*   Look at the first two terms:  $x_{n+1}=x_{n}-\frac{f}{f^{′}}$  (That's just Newton!).
*   Now add the correction:  $-\frac{1}{2}\frac{f^{′′}\cdot f^{2}}{\left(f^{′}\right)^{3}}$ .
*   **Pattern to remember the correction:**
    *   **Top:** Second derivative ( $f^{′′}$ ) times function squared ( $f^{2}$ ).
    *   **Bottom:** First derivative cubed ( $f^{′3}$ ).
    *   _Think:_ "One half, second deriv, square the top, cube the bottom."

* * *

### 5\. Lagrange Interpolation: "The Spotlight Switch"

**The Hack:** Do not memorize the product symbol  $\Pi$ . Remember the **"Cover-Up" Game**.

*   **Goal:** You want a term that is **1** at your special point  $x_{i}$ , and **0** everywhere else.
*   **How to write  $L_{0}\left(x\right)$ :**
    1.  **Numerator:** Write  $\left(x-something\right)$  for _every_ point EXCEPT  $x_{0}$ . (Skip your own index!).
        $$
        \left(x-x_{1}\right)\left(x-x_{2}\right)\dots
        $$
    2.  **Denominator:** Copy the Numerator exactly, but replace  $x$  with  $x_{0}$ .
        $$
        \left(x_{0}-x_{1}\right)\left(x_{0}-x_{2}\right)\dots
        $$
*   **Mnemonic:** "Everything but me, over, Me minus them."

* * *

### 6\. The Operators (Delta Triangle)

**The Hack:** Visualize them on a number line or grid.

| Symbol | Name | Direction | Memory Tip |
| --- | --- | --- | --- |
| $\Delta$ | Forward | $\to$ | "Future - Present" ( $x+h$  minus  $x$ ) |
| $\nabla$ | Backward | $\leftarrow$ | "Present - Past" ( $x$  minus  $x-h$ ) |
| $\delta$ | Central | $\leftrightarrow$ | "Half step Right - Half step Left" |
| $\mu$ | Average | $\frac{1}{2}\left(\dots \right)$ | It's just the mean (add and divide by 2). |
| $E$ | Shift | $Next$ | $E$  for "Elevate" index by 1. |

### Summary Checklist for Exam Day:

1.  **Newton:** Tangent slope ( $f/f^{′}$ ).
2.  **Secant:** Newton with slope formula.
3.  **Muller:** Upside-down Quadratic formula.
4.  **Lagrange:** "Skip me" in the numerator.
5.  **Operators:** Forward looks ahead, Backward looks behind.

## Prompt:
tell for all the formulas

## Response:
You've got the first batch down. Now let's tackle the remaining complex ones: **Systems of Equations, Interpolation Pyramids, and Bivariate differences.**

Here is how to lock these into your memory using logic and patterns.

* * *

### 7\. Newton-Raphson for Systems: "The Matrix Upgrade"

**The Hack:** It is exactly the same as the scalar version, just translated into "Matrix Language."

*   **Scalar Formula:**  $x_{new}=x_{old}-\frac{f\left(x\right)}{f^{′}\left(x\right)}$ 
*   **The Translation:**
    *    $x$  (number)  $\to$  ** $X$ ** (Vector/List of numbers).
    *    $f\left(x\right)$  (height)  $\to$  ** $F\left(X\right)$ ** (Vector of functions).
    *    $f^{′}\left(x\right)$  (slope)  $\to$  ** $J$ ** (Jacobian Matrix of derivatives).
    *   Division ( $1/f^{′}$ )  $\to$  **Matrix Inverse ( $J^{-1}$ )**.

**The Result:**

$$
X_{new}=X_{old}-J^{-1}F\left(X_{old}\right)
$$

**To remember the Jacobian Matrix  $J$ :** Think of it as a grid of "all possible slopes."

*   **Rows** represent the functions ( $f_{1},f_{2}$ ).
*   **Columns** represent the variables ( $x,y$ ).
    $$
    J=\left[\frac{\partial f_{1}}{\partial x}\frac{\partial f_{2}}{\partial x}​\frac{\partial f_{1}}{\partial y}\frac{\partial f_{2}}{\partial y}​\right]
    $$
*   **Mnemonic:** "Row 1 is Function 1, Row 2 is Function 2."

* * *

### 8\. Newton’s Divided Difference: "The Pyramid"

**The Hack:** Don't memorize the formula. Memorize the **Table Structure (Pyramid)**. You build it column by column.

*   **Layer 1 (The  $y$  values):** Just list them:  $y_{0},y_{1},y_{2}...$ 
*   **Layer 2 (First Differences):** It's just "Rise over Run."
    $$
    \frac{y_{1}-y_{0}}{x_{1}-x_{0}}
    $$
*   **Layer 3 (Second Differences):** It's "Difference of the previous differences" divided by the "Total width."
    $$
    \frac{\left(Slope_{2}-Slope_{1}\right)}{x_{2}-x_{0}}
    $$
    _Note: The denominator ( $x_{2}-x_{0}$ ) "spans" the whole group of 3 points._

**The Polynomial Pattern:** The formula just walks down the top diagonal of your pyramid:

$$
P\left(x\right)=y_{0}+\left(x-x_{0}\right)\left[Slope_{0}\right]+\left(x-x_{0}\right)\left(x-x_{1}\right)\left[Curve_{0}\right]+\dots
$$

*   **Mnemonic:** "Add a term, add a factor  $\left(x-x_{k}\right)$ , and grab the next value from the top of the pyramid."

* * *

### 9\. Bivariate Interpolation: "The Rectangle Rule"

**The Hack:** Visualizing the **Inclusion-Exclusion Principle** (like in Venn Diagrams).

**The Formula:**

$$
\Delta _{xy}f=f\left(x+h,y+k\right)-f\left(x,y+k\right)-f\left(x+h,y\right)+f\left(x,y\right)
$$

**The Visualization:** Imagine a rectangle on the  $\left(x,y\right)$  plane.

1.  **Start with the Whole** (Top-Right corner):  $f\left(x+h,y+k\right)$ .
2.  **Remove the Top Strip** (Top-Left): Subtract  $f\left(x,y+k\right)$ .
3.  **Remove the Right Strip** (Bottom-Right): Subtract  $f\left(x+h,y\right)$ .
4.  **Oops, we subtracted the corner twice!** (Bottom-Left): You subtracted  $f\left(x,y\right)$  in step 2 _and_ step 3.
5.  **Correction:** Add  $f\left(x,y\right)$  back in.

**Mnemonic:** "Whole minus Top, minus Right, plus the Corner."

* * *

### 10\. Hermite Interpolation: "The Double Lock"

**The Hack:** Why does it look so scary? Because it locks two things: **Value** AND **Slope**.

*   **Standard Lagrange:** Uses  $\left(x-x_{j}\right)$  terms.
*   **Hermite:** Uses **Squared** terms  $\left(x-x_{j}\right)^{2}$ .
    *   _Why?_ Because squaring a term makes its derivative at the root zero ( $\frac{d}{dx}\left(x-a\right)^{2}=2\left(x-a\right)\to 0$  at  $x=a$ ).
    *   This allows you to adjust the slope at one point without messing up the slopes at the other points.

**Mnemonic:** "Double constraints (Value + Slope) need Double Power (Squared terms)."

* * *

### Summary: The "Cheat Codes"

| Method | The "Cheat Code" |
| --- | --- |
| **Newton-Raphson** | Slide down the tangent:  $x-f/f^{′}$ . |
| **Secant** | Newton, but swap  $f^{′}$  for "Rise/Run". |
| **Muller** | The Quadratic Formula, but upside down. |
| **Chebyshev** | Newton + "Half, 2nd Deriv, Square top, Cube bottom". |
| **System (Newton)** | Scalar division becomes Matrix Inverse ( $J^{-1}$ ). |
| **Lagrange** | "Skip Me" in the numerator product. |
| **Divided Diff** | Build the Pyramid (Rise/Run, widen the Run). |
| **Bivariate** | Rectangle Area: Whole - Top - Side + Corner. |



---
Powered by [Gemini Exporter](https://www.ai-chat-exporter.com)

