import random

questions_file = "questions.txt"
answers_file = "answers.txt"

def get_random_line(filename):
    with open(filename, "r") as file:
        lines = file.readlines()
        return random.choice(lines)

print(get_random_line(questions_file))

print(get_random_line(answers_file), end = "")
print(get_random_line(answers_file), end = "")
print(get_random_line(answers_file), end = "")
print(get_random_line(answers_file), end = "")
print(get_random_line(answers_file), end = "")
