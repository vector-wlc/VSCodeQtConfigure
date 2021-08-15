/*
 * @Coding: utf-8
 * @Author: vector-wlc
 * @Date: 2021-08-14 16:33:26
 * @Description: 
 */
#ifndef __LABEL_TYPE_H__
#define __LABEL_TYPE_H__

#include <qcombobox.h>
#include <qlabel.h>
#include <qlayout.h>

// TEMPLATE CLASS LabelType
// 使用此类将对两个 QClass 打包成一个水平布局的整体
template <class First, class Second>
class HLayoutPair : public QWidget {
public:
    HLayoutPair();
    ~HLayoutPair();
    First first;
    Second second;

private:
    QHBoxLayout h_layout;
};

template <class First, class Second>
HLayoutPair<First, Second>::HLayoutPair()
{
    h_layout.addWidget(&first, 2);
    h_layout.addWidget(&second, 3);
    h_layout.setContentsMargins(0, 0, 0, 0);
    setLayout(&h_layout);
}

template <class First, class Second>
HLayoutPair<First, Second>::~HLayoutPair()
{
}

#endif // __LABEL_TYPE_H__
